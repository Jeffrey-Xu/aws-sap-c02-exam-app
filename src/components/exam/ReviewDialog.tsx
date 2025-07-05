import React from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';
import type { ExamSession, Question } from '../../types';

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: ExamSession;
  questions: Question[];
  currentQuestionIndex: number;
  timeRemaining: number;
  onNavigateToQuestion: (index: number) => void;
  onResumeExam: () => void;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({
  isOpen,
  onClose,
  session,
  questions,
  currentQuestionIndex,
  timeRemaining,
  onNavigateToQuestion,
  onResumeExam
}) => {
  if (!isOpen) return null;

  const answeredQuestions = Object.keys(session.answers).length;
  const unansweredQuestions = questions.length - answeredQuestions;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Exam Progress Review</h2>
            <p className="text-gray-600 mt-1">Review your current progress</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{answeredQuestions}</div>
              <div className="text-sm text-gray-600">Answered</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{unansweredQuestions}</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            Currently on Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close Review
          </Button>
          <Button onClick={() => { onResumeExam(); onClose(); }} className="bg-blue-600 hover:bg-blue-700">
            Resume Exam
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDialog;
