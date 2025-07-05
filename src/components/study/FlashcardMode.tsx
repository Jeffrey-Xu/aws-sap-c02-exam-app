import React, { useState, useEffect } from 'react';
import { RotateCcw, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, Shuffle, Filter, Award } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';
import { useProgressStore } from '../../stores/progressStore';
import { AWS_FLASHCARDS, getFlashcardsByDomain, getFlashcardsByDifficulty, getRandomFlashcards } from '../../data/flashcards';
import type { FlashcardQuestion } from '../../data/flashcards';
import type { ExamDomain } from '../../types';
import { DOMAIN_INFO } from '../../constants';

interface FlashcardModeProps {
  onComplete: () => void;
  initialDomain?: ExamDomain;
}

type FilterType = 'all' | 'domain' | 'difficulty';
type DifficultyLevel = 'basic' | 'intermediate' | 'advanced';

const FlashcardMode: React.FC<FlashcardModeProps> = ({ onComplete, initialDomain }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardQuestion[]>([]);
  const [filterType, setFilterType] = useState<FilterType>(initialDomain ? 'domain' : 'all');
  const [selectedDomain, setSelectedDomain] = useState<ExamDomain | undefined>(initialDomain);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('basic');
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    total: 0
  });

  const { updateQuestionProgress } = useProgressStore();

  useEffect(() => {
    loadFlashcards();
  }, [filterType, selectedDomain, selectedDifficulty]);

  const loadFlashcards = () => {
    let cards: FlashcardQuestion[] = [];
    
    switch (filterType) {
      case 'domain':
        cards = selectedDomain ? getFlashcardsByDomain(selectedDomain) : AWS_FLASHCARDS;
        break;
      case 'difficulty':
        cards = getFlashcardsByDifficulty(selectedDifficulty);
        break;
      default:
        cards = getRandomFlashcards(20); // Random selection of 20 cards
    }
    
    setFlashcards(cards.sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionStats({ correct: 0, incorrect: 0, skipped: 0, total: 0 });
  };

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      // Session complete
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleKnowIt = () => {
    if (currentCard) {
      // Record as correct for progress tracking
      updateQuestionProgress(parseInt(currentCard.id.replace(/\D/g, '')), true, 5);
      setSessionStats(prev => ({ 
        ...prev, 
        correct: prev.correct + 1,
        total: prev.total + 1
      }));
    }
    handleNext();
  };

  const handleDontKnow = () => {
    if (currentCard) {
      // Record as incorrect for progress tracking
      updateQuestionProgress(parseInt(currentCard.id.replace(/\D/g, '')), false, 10);
      setSessionStats(prev => ({ 
        ...prev, 
        incorrect: prev.incorrect + 1,
        total: prev.total + 1
      }));
    }
    handleNext();
  };

  const handleSkip = () => {
    setSessionStats(prev => ({ 
      ...prev, 
      skipped: prev.skipped + 1,
      total: prev.total + 1
    }));
    handleNext();
  };

  const handleAnswerSelect = (selectedAnswer: string) => {
    const isCorrect = selectedAnswer === currentCard.correctAnswer;
    if (isCorrect) {
      handleKnowIt();
    } else {
      handleDontKnow();
    }
  };

  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0;
  const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

  if (!currentCard) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">No flashcards available for the selected filter</div>
          <Button onClick={onComplete}>Back to Practice</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AWS Concepts Flashcards</h2>
          <p className="text-gray-600">
            Card {currentIndex + 1} of {flashcards.length} • {currentCard.service}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={loadFlashcards}>
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle
          </Button>
          <Button variant="outline" onClick={onComplete}>
            Exit Flashcards
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="filter"
                checked={filterType === 'all'}
                onChange={() => setFilterType('all')}
                className="mr-2"
              />
              <span className="text-sm">All Topics</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="filter"
                checked={filterType === 'domain'}
                onChange={() => setFilterType('domain')}
                className="mr-2"
              />
              <span className="text-sm">By Domain</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="filter"
                checked={filterType === 'difficulty'}
                onChange={() => setFilterType('difficulty')}
                className="mr-2"
              />
              <span className="text-sm">By Difficulty</span>
            </label>
          </div>
          
          {filterType === 'domain' && (
            <select
              value={selectedDomain || ''}
              onChange={(e) => setSelectedDomain(e.target.value as ExamDomain)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="">Select Domain</option>
              {Object.entries(DOMAIN_INFO).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          )}
          
          {filterType === 'difficulty' && (
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          )}
        </div>
      </Card>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <ProgressBar progress={progress} color="blue" />
      </div>

      {/* Stats */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span>Correct: {sessionStats.correct}</span>
        </div>
        <div className="flex items-center text-red-600">
          <XCircle className="w-4 h-4 mr-1" />
          <span>Incorrect: {sessionStats.incorrect}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <span>Skipped: {sessionStats.skipped}</span>
        </div>
        {sessionStats.total > 0 && (
          <div className="flex items-center text-blue-600">
            <Award className="w-4 h-4 mr-1" />
            <span>Accuracy: {accuracy}%</span>
          </div>
        )}
      </div>

      {/* Flashcard */}
      <Card className="min-h-[500px]">
        <div className="h-full flex flex-col">
          {/* Card Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {currentCard.service}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  currentCard.difficulty === 'basic' ? 'bg-green-100 text-green-800' :
                  currentCard.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentCard.difficulty.toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {DOMAIN_INFO[currentCard.domain].name}
              </span>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentCard.question}
            </h3>
          </div>

          {/* Answer Options (for multiple choice) */}
          {currentCard.type === 'multiple-choice' && currentCard.options && !showAnswer && (
            <div className="space-y-3 mb-6">
              {currentCard.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                </button>
              ))}
            </div>
          )}

          {/* Yes/No Options */}
          {currentCard.type === 'yes-no' && !showAnswer && (
            <div className="flex justify-center space-x-4 mb-6">
              <Button
                onClick={() => handleAnswerSelect('true')}
                className="px-8 py-3 bg-green-600 hover:bg-green-700"
              >
                Yes / True
              </Button>
              <Button
                onClick={() => handleAnswerSelect('false')}
                className="px-8 py-3 bg-red-600 hover:bg-red-700"
              >
                No / False
              </Button>
            </div>
          )}

          {/* Show Answer Button */}
          {!showAnswer && (
            <div className="flex justify-center mb-6">
              <Button onClick={() => setShowAnswer(true)} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Show Answer & Explanation
              </Button>
            </div>
          )}

          {/* Answer & Explanation */}
          {showAnswer && (
            <div className="space-y-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">
                  Correct Answer: {String(currentCard.correctAnswer)}
                </h4>
                <p className="text-green-800">{currentCard.explanation}</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Key Points to Remember:</h4>
                <ul className="space-y-1">
                  {currentCard.keyPoints.map((point, index) => (
                    <li key={index} className="text-blue-800 text-sm">
                      • {point}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button
                  variant="outline"
                  onClick={handleDontKnow}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Need More Study
                </Button>
                <Button onClick={handleSkip} variant="outline">
                  Skip
                </Button>
                <Button
                  onClick={handleKnowIt}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Got It!
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <Button onClick={() => setShowAnswer(!showAnswer)} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          {showAnswer ? 'Hide Answer' : 'Show Answer'}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleNext}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default FlashcardMode;
