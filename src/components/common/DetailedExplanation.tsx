import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Lightbulb, Cloud, BookOpen } from 'lucide-react';
import type { Question } from '../../types';

interface DetailedExplanationProps {
  question: Question;
  userAnswer?: string;
}

const DetailedExplanation: React.FC<DetailedExplanationProps> = ({ question, userAnswer }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    optionAnalysis: false,
    keyInsights: false,
    awsServices: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderCollapsibleSection = (
    key: string,
    title: string,
    icon: React.ReactNode,
    content: React.ReactNode,
    defaultExpanded = false
  ) => {
    const isExpanded = expandedSections[key] ?? defaultExpanded;
    
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection(key)}
          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-medium text-gray-900">{title}</span>
          </div>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
        {isExpanded && (
          <div className="p-4 bg-white">
            {content}
          </div>
        )}
      </div>
    );
  };

  const renderOptionAnalysis = () => {
    if (!question.detailed_reasoning?.option_analyses) {
      return <p className="text-gray-500">No detailed option analysis available.</p>;
    }

    return (
      <div className="space-y-4">
        {Object.entries(question.detailed_reasoning.option_analyses).map(([letter, analysis]) => {
          const isUserAnswer = userAnswer === letter;
          const isCorrect = analysis.is_correct;
          
          return (
            <div
              key={letter}
              className={`border rounded-lg p-4 ${
                isCorrect 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-red-200 bg-red-50'
              } ${isUserAnswer ? 'ring-2 ring-blue-300' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                  isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {letter}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <XCircle size={16} className="text-red-600" />
                    )}
                    <span className={`font-medium ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Option {letter} {isUserAnswer ? '(Your Answer)' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {analysis.reasoning.map((reason, index) => (
                      <p key={index} className="text-sm text-gray-700 leading-relaxed">
                        {reason}
                      </p>
                    ))}
                  </div>
                  
                  {analysis.key_points.services.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs font-medium text-gray-600">AWS Services: </span>
                      <div className="inline-flex flex-wrap gap-1 mt-1">
                        {analysis.key_points.services.map((service, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderKeyInsights = () => {
    const reasoning = question.detailed_reasoning;
    if (!reasoning) return <p className="text-gray-500">No key insights available.</p>;

    return (
      <div className="space-y-4">
        {reasoning.why_correct_answer_wins.length > 0 && (
          <div>
            <h4 className="font-medium text-green-700 mb-2 flex items-center">
              <CheckCircle size={16} className="mr-2" />
              Why the Correct Answer Wins
            </h4>
            <ul className="space-y-1">
              {reasoning.why_correct_answer_wins.map((insight, index) => (
                <li key={index} className="text-sm text-gray-700 leading-relaxed flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {reasoning.common_mistakes.length > 0 && (
          <div>
            <h4 className="font-medium text-red-700 mb-2 flex items-center">
              <XCircle size={16} className="mr-2" />
              Common Mistakes to Avoid
            </h4>
            <ul className="space-y-1">
              {reasoning.common_mistakes.map((mistake, index) => (
                <li key={index} className="text-sm text-gray-700 leading-relaxed flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  {mistake}
                </li>
              ))}
            </ul>
          </div>
        )}

        {reasoning.summary_reasoning?.key_decision_factors && (
          <div>
            <h4 className="font-medium text-blue-700 mb-2 flex items-center">
              <Lightbulb size={16} className="mr-2" />
              Key Decision Factors
            </h4>
            <ul className="space-y-1">
              {reasoning.summary_reasoning.key_decision_factors.map((factor, index) => (
                <li key={index} className="text-sm text-gray-700 leading-relaxed flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderAWSServices = () => {
    const services = question.aws_services || question.detailed_reasoning?.aws_services || [];
    const concepts = question.key_concepts || question.detailed_reasoning?.key_concepts || [];

    if (services.length === 0 && concepts.length === 0) {
      return <p className="text-gray-500">No AWS services or concepts identified.</p>;
    }

    return (
      <div className="space-y-4">
        {services.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-700 mb-3 flex items-center">
              <Cloud size={16} className="mr-2" />
              AWS Services Involved
            </h4>
            <div className="flex flex-wrap gap-2">
              {services.map((service, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {concepts.length > 0 && (
          <div>
            <h4 className="font-medium text-purple-700 mb-3 flex items-center">
              <BookOpen size={16} className="mr-2" />
              Key Concepts Tested
            </h4>
            <div className="flex flex-wrap gap-2">
              {concepts.map((concept, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Detailed Explanation</h3>
      
      <div className="space-y-4">
        {/* Overview Section */}
        {renderCollapsibleSection(
          'overview',
          'Overview & Basic Explanation',
          <BookOpen size={18} className="text-blue-600" />,
          <div className="space-y-4">
            <div>
              <p className="text-gray-700 leading-relaxed">{question.explanation}</p>
            </div>
            <div>
              <h4 className="font-medium text-green-700 mb-2">✅ Why the correct answer is right:</h4>
              <p className="text-gray-700 leading-relaxed">{question.why_correct}</p>
            </div>
            {question.why_others_wrong.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">❌ Why other options are wrong:</h4>
                <ul className="space-y-2">
                  {question.why_others_wrong.map((explanation, index) => (
                    <li key={index} className="text-gray-700 leading-relaxed">
                      • {explanation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>,
          true
        )}

        {/* Detailed Option Analysis */}
        {question.detailed_reasoning?.option_analyses && renderCollapsibleSection(
          'optionAnalysis',
          'Detailed Option Analysis',
          <CheckCircle size={18} className="text-green-600" />,
          renderOptionAnalysis()
        )}

        {/* Key Insights */}
        {question.detailed_reasoning && renderCollapsibleSection(
          'keyInsights',
          'Key Insights & Decision Factors',
          <Lightbulb size={18} className="text-yellow-600" />,
          renderKeyInsights()
        )}

        {/* AWS Services & Concepts */}
        {renderCollapsibleSection(
          'awsServices',
          'AWS Services & Key Concepts',
          <Cloud size={18} className="text-blue-600" />,
          renderAWSServices()
        )}
      </div>
    </div>
  );
};

export default DetailedExplanation;
