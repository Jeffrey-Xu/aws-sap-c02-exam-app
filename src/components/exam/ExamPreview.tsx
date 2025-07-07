import React, { useState } from 'react';
import { Eye, EyeOff, Clock, Target, BookOpen, Flag, Play, RefreshCw } from 'lucide-react';
import type { Question, ExamDomain } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import { EXAM_CONFIG, DOMAIN_INFO } from '../../constants';
import { formatTime, getQuestionsWithDomainRatio } from '../../utils/questionUtils';

interface ExamPreviewProps {
  questions: Question[]; // Currently prepared questions for preview
  allQuestions: Question[]; // Full question bank for generating new sets
  onPrepareQuestions: (newQuestions: Question[]) => void;
  onStartTimedExam: () => void;
  onClose: () => void;
}

const ExamPreview: React.FC<ExamPreviewProps> = ({
  questions,
  allQuestions,
  onPrepareQuestions,
  onStartTimedExam,
  onClose
}) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const examDuration = EXAM_CONFIG.FULL_EXAM_DURATION; // already in seconds
  
  // Calculate domain distribution of current questions
  const questionsByDomain = questions.reduce((acc, question) => {
    const domain = question.category || 'other';
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handlePrepareQuestions = () => {
    // Generate fresh questions using domain ratios
    const newQuestions = getQuestionsWithDomainRatio(allQuestions, EXAM_CONFIG.FULL_EXAM_QUESTIONS);
    onPrepareQuestions(newQuestions);
    setCurrentPreviewIndex(0); // Reset to first question
  };

  const handleStartTimedExam = () => {
    // Start the actual timed exam with current questions
    onStartTimedExam();
  };

  const currentQuestion = questions[currentPreviewIndex];

  return (
    <div className="space-y-6">
      {/* Exam Overview */}
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AWS SAP-C02 Practice Exam Preview
          </h2>
          <p className="text-gray-600">
            Review the exam structure and sample questions before you begin
          </p>
        </div>

        {/* Exam Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{formatTime(examDuration)}</div>
            <div className="text-sm text-gray-600">Time Limit</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <BookOpen className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{EXAM_CONFIG.PASSING_PERCENTAGE}%</div>
            <div className="text-sm text-gray-600">Passing Score</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Flag className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{Object.keys(questionsByDomain).length}</div>
            <div className="text-sm text-gray-600">Domains</div>
          </div>
        </div>

        {/* Domain Breakdown */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Question Distribution by Domain</h3>
          <div className="space-y-3">
            {Object.entries(DOMAIN_INFO).map(([domainKey, domainInfo]) => {
              const currentCount = questionsByDomain[domainKey] || 0;
              const currentPercentage = questions.length > 0 ? Math.round((currentCount / questions.length) * 100) : 0;
              const officialPercentage = domainInfo.percentage;
              
              return (
                <div key={domainKey} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{domainInfo.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{domainInfo.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {currentCount} questions ({currentPercentage}%)
                      </div>
                      <div className="text-xs text-gray-500">
                        Target: {officialPercentage}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar showing current vs target */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        Math.abs(currentPercentage - officialPercentage) <= 2 
                          ? 'bg-green-500' 
                          : 'bg-aws-orange'
                      }`}
                      style={{ width: `${Math.min(currentPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {questions.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>💡 Tip:</strong> Click "Prepare Questions" to generate a fresh set with optimal domain distribution 
                matching the official AWS SAP-C02 exam ratios.
              </p>
            </div>
          )}
        </div>

        {/* Exam Rules */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">📋 Exam Rules & Guidelines</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• You have {Math.floor(EXAM_CONFIG.FULL_EXAM_DURATION / 60)} minutes to complete {questions.length} questions</li>
            <li>• You can flag questions for review and navigate between questions</li>
            <li>• The exam will auto-submit when time expires</li>
            <li>• You need {EXAM_CONFIG.PASSING_PERCENTAGE}% or higher to pass</li>
            <li>• Some questions may have multiple correct answers</li>
            <li>• Read each question carefully before answering</li>
          </ul>
        </div>

        {/* Question Preview Toggle */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowQuestions(!showQuestions)}
            className="flex items-center"
          >
            {showQuestions ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
            {showQuestions ? 'Hide' : 'Preview'} Questions
          </Button>
        </div>

        {/* Question Preview */}
        {showQuestions && (
          <div className="mb-6 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Question Preview</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPreviewIndex(Math.max(0, currentPreviewIndex - 1))}
                  disabled={currentPreviewIndex === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  {currentPreviewIndex + 1} of {questions.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPreviewIndex(Math.min(questions.length - 1, currentPreviewIndex + 1))}
                  disabled={currentPreviewIndex === questions.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>

            {currentQuestion && (
              <Card className="bg-gray-50">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600">
                      Question {currentPreviewIndex + 1}
                    </span>
                    {currentQuestion.category && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {currentQuestion.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 leading-relaxed">
                    {currentQuestion.question}
                  </h4>
                </div>

                <div className="space-y-2">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.letter}
                      className="flex items-start space-x-3 p-3 bg-white rounded border"
                    >
                      <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium">
                        {option.letter}
                      </div>
                      <div className="flex-1 text-sm text-gray-700 break-words">
                        {option.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
                  <strong>Note:</strong> This is just a preview. Answers and explanations will be available after you complete the exam.
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div className="text-center">
            <Button onClick={handlePrepareQuestions} size="lg" className="flex items-center mb-2" variant="outline">
              <RefreshCw size={20} className="mr-2" />
              Prepare Questions
            </Button>
            <p className="text-xs text-gray-500">
              Generate fresh questions using official exam ratios
            </p>
          </div>
          
          <div className="text-center">
            <Button onClick={handleStartTimedExam} size="lg" className="flex items-center mb-2 bg-green-600 hover:bg-green-700">
              <Play size={20} className="mr-2" />
              Start Timed Exam ({formatTime(examDuration)})
            </Button>
            <p className="text-xs text-gray-500">
              Begin the official 180-minute exam
            </p>
          </div>
          
          <Button variant="outline" onClick={onClose} size="lg">
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ExamPreview;
