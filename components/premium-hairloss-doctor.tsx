"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Camera, ArrowRight, Star, 
  User, X, FileImage,
  Loader2,
  Send,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

//AI chatbot
// Chat responses data
const chatResponses = {
  initial_greeting: {
    message: "Hello! I'm Dr. Smith, your AI hair loss specialist. How can I assist you today?",
    follow_ups: [
      "Are you experiencing any specific hair or scalp concerns?",
      "Would you like to learn about our treatment options?",
      "Would you like a personalized hair assessment?"
    ]
  },
  symptoms: {
    hair_loss: {
      patterns: {
        receding: {
          message: "A receding hairline can be caused by various factors. Can you tell me when you first noticed this change?",
          follow_up: {
            recent: "Recent changes might be more responsive to early intervention. Have you noticed any other changes in your hair or scalp?",
            gradual: "Gradual recession is often associated with androgenetic alopecia. Is there any family history of similar patterns?",
            rapid: "Rapid changes might indicate an underlying condition. Have you experienced any recent stress or health changes?"
          }
        },
        crown: {
          message: "Thinning at the crown is a common pattern. When did you first notice this?",
          follow_up: {
            early: "Early intervention can be very effective. Have you tried any treatments so far?",
            progressive: "Progressive thinning might benefit from combination therapy. Would you like to explore treatment options?",
            advanced: "There are several effective treatments for advanced thinning. Shall we discuss your options?"
          }
        },
        diffuse: {
          message: "Diffuse thinning can have various causes. Have you noticed any specific triggers?",
          follow_up: {
            stress: "Stress-related hair loss often improves with stress management. Would you like to discuss treatment approaches?",
            medical: "This pattern might be related to underlying health factors. Have you had any recent health changes?",
            unknown: "Let's work together to identify potential causes. Can you tell me about your lifestyle and daily routine?"
          }
        }
      }
    },
    scalp_conditions: {
      dandruff: {
        message: "I understand you're experiencing dandruff. Is it accompanied by itching or redness?",
        follow_up: {
          mild: "Mild dandruff often responds well to specialized shampoos. How often do you currently wash your hair?",
          moderate: "Moderate cases might need targeted treatment. Is the flaking worse in any particular area?",
          severe: "Severe cases might indicate seborrheic dermatitis. Have you noticed any patterns in when it worsens?"
        }
      },
      itching: {
        message: "Scalp itching can be quite bothersome. Is it constant or does it come and go?",
        follow_up: {
          constant: "Persistent itching might indicate a specific condition. Are there any visible signs on your scalp?",
          intermittent: "Intermittent itching could be triggered by specific factors. Have you noticed any patterns?",
          recent: "Recent onset of itching might be related to changes in products or environment. Have you made any recent changes?"
        }
      },
      oily: {
        message: "An oily scalp can affect hair health. How often do you currently wash your hair?",
        follow_up: {
          daily: "Daily washing might affect your scalp's natural oil balance. What type of shampoo do you use?",
          frequent: "Frequent washing might be compensating for excess oil. Have you noticed any correlation with hair loss?",
          infrequent: "Infrequent washing might allow oil buildup. Would you like to discuss optimal washing frequency?"
        }
      }
    }
  }
};

// AI Chatbot Component
const formatMessageText = (text: string) => {
  if (text.includes('[Book Appointment]')) {
    return text.replace(
      '[Book Appointment]',
      '<a href="https://hrdoc-appointment.vercel.app/" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-700 underline">Book Appointment</a>'
    );
  }
  return text;
};

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Dr. Smith, your AI hair loss specialist. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState({
    symptomsDiscussed: new Set(),
    messageCount: 0,
    needsConsult: false,
    appointmentSuggested: false,
    recommendedProducts: []
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hairLossProducts = {
    early: [
      'HairLoss Doctor Serum 2.5 Neo - Apply twice daily',
      'HairLoss Doctor Biotin Complex Plus - 1 tablet daily',
      'HairLoss Doctor Scalp Therapy Foam - Use during evening routine'
    ],
    moderate: [
      'HairLoss Doctor Advanced Formula 5.0 - Morning application',
      'HairLoss Doctor DHT Blocker Elite - 2 capsules daily',
      'HairLoss Doctor Revitalizing Shampoo Pro - Use 3x weekly'
    ],
    severe: [
      'HairLoss Doctor Maximum Strength Solution 7.5 - Twice daily',
      'HairLoss Doctor Nutrient Fusion Tablets - Morning supplement',
      'HairLoss Doctor Scalp Energizing Serum - Evening routine'
    ],
    scalp: [
      'HairLoss Doctor Soothing Scalp Treatment - Apply as needed',
      'HairLoss Doctor Anti-Dandruff Complex - Use 2x weekly',
      'HairLoss Doctor Scalp Balancing Shampoo - Regular use'
    ]
  };

  const generateResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    let response = '';
    let productRecommendations: string[] = [];

    // Update context
    setConversationContext(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1,
      symptomsDiscussed: new Set([...prev.symptomsDiscussed, getConcernType(input)])
    }));

    const checkKeywords = (keywords: string[]) => keywords.some(keyword => input.includes(keyword));

    // Enhanced keyword detection
    function getConcernType(input: string): string {
      if (checkKeywords(['bald', 'baldness', 'male pattern', 'mpb'])) return 'baldness';
      if (checkKeywords(['receding', 'hairline', 'forehead', 'temple'])) return 'hairline';
      if (checkKeywords(['crown', 'top', 'vertex', 'thinning'])) return 'crown';
      if (checkKeywords(['overall', 'diffuse', 'everywhere', 'hair fall', 'falling'])) return 'diffuse';
      if (checkKeywords(['dandruff', 'flakes', 'flaking', 'dry scalp'])) return 'dandruff';
      if (checkKeywords(['itch', 'itchy', 'itching', 'irritated'])) return 'itching';
      if (checkKeywords(['oily', 'greasy', 'oil', 'sebum'])) return 'oily';
      if (checkKeywords(['patches', 'spot', 'circular', 'alopecia areata'])) return 'patches';
      return 'general';
    }

    // Enhanced response generation with product recommendations
    if (checkKeywords(['bald', 'baldness', 'male pattern', 'mpb'])) {
      response = "Male pattern baldness is a common genetic condition. Based on your description, I recommend:";
      productRecommendations = hairLossProducts.moderate;
    } else if (checkKeywords(['receding', 'hairline', 'forehead', 'temple'])) {
      response = "For receding hairline concerns, I suggest trying our early intervention products:";
      productRecommendations = hairLossProducts.early;
    } else if (checkKeywords(['crown', 'top', 'vertex', 'thinning'])) {
      response = "For crown thinning, these products have shown excellent results:";
      productRecommendations = hairLossProducts.moderate;
    } else if (checkKeywords(['overall', 'diffuse', 'everywhere', 'hair fall', 'falling'])) {
      response = "For widespread thinning, I recommend our comprehensive treatment approach:";
      productRecommendations = hairLossProducts.severe;
    } else if (checkKeywords(['dandruff', 'flakes', 'flaking', 'dry scalp', 'itch', 'itchy', 'itching', 'irritated'])) {
      response = "For scalp concerns, these specialized products can help:";
      productRecommendations = hairLossProducts.scalp;
    } else if (checkKeywords(['oily', 'greasy', 'oil', 'sebum'])) {
      response = "For oily scalp management, try these balancing products:";
      productRecommendations = hairLossProducts.scalp;
    } else if (input.length < 2) {
      response = "Could you tell me more about your hair or scalp concerns?";
    } else {
      response = "I understand you're concerned about your hair health. Could you describe your specific symptoms?";
    }

    // Add product recommendations to response
    if (productRecommendations.length > 0) {
      response += "\n\nRecommended products:\n" + productRecommendations.map(product => `• ${product}`).join('\n');
      response += "\n\nWould you like to learn more about any of these products?";
    }

    // Appointment suggestion logic
    const shouldSuggestConsult = conversationContext.symptomsDiscussed.size >= 2 || 
                                conversationContext.messageCount >= 4;

    if (shouldSuggestConsult && !conversationContext.appointmentSuggested) {
      setConversationContext(prev => ({
        ...prev,
        appointmentSuggested: true
      }));
      const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
      const appointmentTime = tomorrow.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const appointmentDate = tomorrow.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });

      response += `\n\nFor a personalized treatment plan, I recommend a professional consultation. Would you like to schedule an appointment for ${appointmentDate} at ${appointmentTime}?`;
    }

    return response;
  };

  // Function to handle sending the user's message and receiving a response
  const sendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputMessage,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages([...messages, newMessage]);
      setInputMessage('');
      setIsTyping(true);

      setTimeout(() => {
        const botResponse = generateResponse(newMessage.text);
        setMessages(prevMessages => [
          ...prevMessages,
          { id: prevMessages.length + 1, text: botResponse, sender: 'bot', timestamp: new Date() }
        ]);
        setIsTyping(false);
      }, 1000);
    }
  };
  
  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: inputMessage.trim(),
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      
      setIsTyping(true);
      setTimeout(() => {
        const botMessage = {
          id: messages.length + 2,
          text: generateResponse(inputMessage),
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-6 z-50">
        <Button 
          onClick={() => setIsOpen(true)}
          className="bg-red-600 hover:bg-red-700 w-12 h-12 flex items-center justify-center shadow-lg"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 w-96 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
      <div className="bg-red-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <User className="h-6 w-6" />
          <div>
            <p className="font-semibold">Dr. Smith</p>
            <p className="text-xs">Hair Loss Specialist</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="h-96 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-800 shadow'
              }`}
            >
              <p className="whitespace-pre-line">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-white rounded-lg p-3 shadow">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <Button 
            type="submit"
            className="bg-red-600 hover:bg-red-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

// Type definitions
type AnalysisState = 'idle' | 'analyzing' | 'complete';

interface AnalysisResult {
  hairLossType: string;
  severity: string;
  coverage: string;
  recommendations: string[];
}

interface Question {
  id: string;
  question: string;
  options: string[];
}

const PremiumHairLossDoctor = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    {
      id: 'age',
      question: 'What is your age?',
      options: ['18-25', '26-35', '36-45', '46+']
    },
    {
      id: 'pattern',
      question: 'What pattern of hair loss are you experiencing?',
      options: ['Receding hairline', 'Crown thinning', 'Overall thinning', 'Patchy hair loss']
    },
    {
      id: 'duration',
      question: 'How long have you been experiencing hair loss?',
      options: ['Less than 6 months', '6-12 months', '1-2 years', 'More than 2 years']
    },
    {
      id: 'family',
      question: 'Is there a family history of hair loss?',
      options: ['Yes', 'No', 'Not sure']
    },
    {
      id: 'lifestyle',
      question: 'Which best describes your lifestyle?',
      options: ['High stress', 'Moderate stress', 'Low stress', 'Varies significantly']
    }
  ];

  const analysisOptions = [
    {
      hairLossType: 'Early Stage Androgenetic Alopecia',
      severity: 'Mild',
      coverage: '85%',
      recommendations: [
        'HairLoss Doctor Serum 2.5 Neo - Apply twice daily',
        'HairLoss Doctor Biotin Complex Plus - 1 tablet daily',
        'HairLoss Doctor Scalp Therapy Foam - Use during evening routine',
        'Consider our Micro-Needling Treatment Package'
      ]
    },
    {
      hairLossType: 'Progressive Pattern Thinning',
      severity: 'Moderate',
      coverage: '70%',
      recommendations: [
        'HairLoss Doctor Advanced Formula 5.0 - Morning application',
        'HairLoss Doctor DHT Blocker Elite - 2 capsules daily',
        'HairLoss Doctor Revitalizing Shampoo Pro - Use 3x weekly',
        'Book consultation for our PRP Treatment Program'
      ]
    },
    {
      hairLossType: 'Diffuse Hair Thinning',
      severity: 'Moderate to Severe',
      coverage: '60%',
      recommendations: [
        'HairLoss Doctor Maximum Strength Solution 7.5 - Twice daily',
        'HairLoss Doctor Nutrient Fusion Tablets - Morning supplement',
        'HairLoss Doctor Scalp Energizing Serum - Evening routine',
        'Evaluate eligibility for our Laser Therapy Program'
      ]
    }
  ];

  const getImageHash = useCallback((imageData: string): number => {
    let hash = 0;
    for (let i = 0; i < imageData.length; i++) {
      const char = imageData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }, []);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
        }
      };
      reader.onerror = () => console.error('File reading has failed');
      reader.readAsDataURL(file);
      setAnalysisState('idle');
      setAnalysisResults(null);
    }
  };

  const handleUploadSubmit = useCallback(() => {
    setAnalysisState('analyzing');
  
    setTimeout(() => {
      if (previewUrl) {
        const imageHash = getImageHash(previewUrl);
        const resultIndex = imageHash % analysisOptions.length;
  
        setAnalysisState('complete');
        setAnalysisResults(analysisOptions[resultIndex]);
      }
    }, 3000);
  }, [previewUrl, getImageHash, analysisOptions]);
  
  const handleAnswerSelect = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: answer,
    }));
  
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      const answerHash = Object.values(answers).join('').length;
      const resultIndex = answerHash % analysisOptions.length;
      setAnalysisResults(analysisOptions[resultIndex]);
      setAnalysisState('complete');
    }
  };
  
  const renderPhotoAnalysisContent = () => {
    if (analysisState === 'analyzing') {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <p className="text-sm text-gray-600">Analyzing your photo...</p>
        </div>
      );
    }
  
    if (analysisState === 'complete' && analysisResults) {
      return (
        <div className="space-y-4 py-4">
          <Alert className="bg-green-50 border-green-200">
            <AlertTitle className="text-green-800">Analysis Complete</AlertTitle>
            <AlertDescription className="text-green-700">
              Based on your photo, we've prepared personalized recommendations.
            </AlertDescription>
          </Alert>
  
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Diagnosis:</h4>
              <p className="text-gray-700">{analysisResults.hairLossType}</p>
            </div>
  
            <div>
              <h4 className="font-semibold mb-2">Severity Level:</h4>
              <p className="text-gray-700">{analysisResults.severity}</p>
            </div>
  
            <div>
              <h4 className="font-semibold mb-2">Hair Coverage:</h4>
              <p className="text-gray-700">{analysisResults.coverage}</p>
            </div>
  
            <div>
              <h4 className="font-semibold mb-2">Recommendations:</h4>
              <ul className="list-disc pl-5 space-y-2">
                {analysisResults.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
  
          <Button 
            onClick={() => {
              setShowUploadModal(false);
              setAnalysisState('idle');
            }} 
            className="w-full mt-4"
          >
            Close
          </Button>
        </div>
      );
    }
  
    return null;
  };

  const renderQuestionnaireContent = () => {
    switch (analysisState) {
      case 'analyzing':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <p className="text-sm text-gray-600">Analyzing your responses...</p>
          </div>
        );
      case 'complete':
        if (!analysisResults) return null;
        return (
          <div className="space-y-4 py-4">
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle className="text-green-800">Analysis Complete</AlertTitle>
              <AlertDescription className="text-green-700">
                Based on your responses, we've prepared personalized recommendations.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Diagnosis:</h4>
                <p className="text-gray-700">{analysisResults.hairLossType}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Severity Level:</h4>
                <p className="text-gray-700">{analysisResults.severity}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Hair Coverage:</h4>
                <p className="text-gray-700">{analysisResults.coverage}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Recommendations:</h4>
                <ul className="list-disc pl-5 space-y-2">
                  {analysisResults.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Button 
              onClick={() => {
                setShowQuestionnaire(false);
                setCurrentQuestion(0);
                setAnswers({});
                setAnalysisState('idle');
              }} 
              className="w-full mt-4"
            >
              Close
            </Button>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">
              {questions[currentQuestion].question}
            </h3>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option) => (
                <Button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  variant="outline"
                  className="w-full text-left justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="min-h-screen bg-white flex flex-col">
        {/* Your existing header */}
        {/* Your existing dialogs */}
        {/* Your existing section */}
         {/* Add this line before the footer */}
        {/* Your existing footer */}
      
      <header className="bg-red-600 text-white py-4 px-6 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">HairLoss Doctor AI</h1>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-white hover:text-white px-4 py-2 relative group">
              <span>About</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </a>
            <a href="#" className="text-white hover:text-white px-4 py-2 relative group">
              <span>Services</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </a>
            <a href="#" className="text-white hover:text-white px-4 py-2 relative group">
              <span>Success Stories</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </a>
            <a href="#" className="text-white hover:text-white px-4 py-2 relative group">
              <span>Blog</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform"></span>
            </a>
          </nav>
        </div>
      </header>

      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Your Photo</DialogTitle>
            <DialogDescription>
              Upload a clear photo of your scalp area for AI analysis
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileImage className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            ) : (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedImage(null);
                    setAnalysisState('idle');
                    setAnalysisResults(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {analysisState === 'idle' && previewUrl && (
              <Button 
                onClick={handleUploadSubmit}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Analyze Photo
              </Button>
            )}
            
            {renderPhotoAnalysisContent()}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showQuestionnaire} onOpenChange={setShowQuestionnaire}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hair Loss Analysis</DialogTitle>
            <DialogDescription>
              Answer a few questions to receive personalized recommendations
            </DialogDescription>
          </DialogHeader>
          {renderQuestionnaireContent()}
        </DialogContent>
      </Dialog>

      <section className="bg-gradient-to-b from-red-50 to-white py-20 flex-grow">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Reverse Hair Loss with AI-Powered Solutions
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Get personalized treatment recommendations backed by advanced AI analysis 
              and trusted by thousands of satisfied clients worldwide.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6"></div>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button 
                size="lg"
                onClick={() => setShowUploadModal(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Camera className="mr-2" />
                Upload Your Photo
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
                onClick={() => setShowQuestionnaire(true)}
              >
                Start Manual Analysis
                <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      <AIChatbot />
      </div>
      {/* New Footer Section */}
      <footer className="fixed bottom-0 left-0 w-full bg-red-600 text-white py-3 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center items-center text-sm">
            <p>Powered by Innocode Solutions © {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>

  );
};

export default PremiumHairLossDoctor;