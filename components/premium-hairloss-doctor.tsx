"use client";
import React, { useState, useCallback } from 'react';
import { 
  Camera, ArrowRight, Star, 
  User, X, FileImage,
  Loader2
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
      {/* New Footer Section */}
      <footer className="bg-red-600 text-white py-3">
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