import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import type { QuestionFilters, ExamDomain, QuestionStatus } from '../../types';
import { DOMAIN_INFO } from '../../constants';
import Button from '../common/Button';

interface QuestionFiltersProps {
  filters: QuestionFilters;
  onFiltersChange: (filters: Partial<QuestionFilters>) => void;
  onReset: () => void;
  questionCounts?: {
    total: number;
    filtered: number;
    byCategory: Record<ExamDomain, number>;
    byStatus: Record<QuestionStatus, number>;
  };
}

const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  questionCounts
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-500" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw size={16} className="mr-1" />
          Reset
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-aws-orange focus:border-aws-orange"
            />
          </div>
        </div>
        
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Domain
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => onFiltersChange({ 
              category: e.target.value ? e.target.value as ExamDomain : undefined 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-aws-orange focus:border-aws-orange"
          >
            <option value="">All Domains</option>
            {Object.entries(DOMAIN_INFO).map(([key, info]) => (
              <option key={key} value={key}>
                {info.name} ({info.percentage}%)
              </option>
            ))}
          </select>
        </div>
        
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFiltersChange({ 
              status: e.target.value ? e.target.value as QuestionStatus : undefined 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-aws-orange focus:border-aws-orange"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="practicing">Practicing</option>
            <option value="mastered">Mastered</option>
            <option value="needs-review">Needs Review</option>
          </select>
        </div>
        
        {/* Bookmarked Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bookmarked
          </label>
          <div className="flex items-center space-x-4 py-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.bookmarked || false}
                onChange={(e) => onFiltersChange({ bookmarked: e.target.checked || undefined })}
                className="rounded border-gray-300 text-aws-orange focus:ring-aws-orange"
              />
              <span className="ml-2 text-sm text-gray-700">Only bookmarked</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Question Counts */}
      {questionCounts && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {questionCounts.filtered} of {questionCounts.total} questions
            </span>
            
            {filters.category && questionCounts.byCategory[filters.category] && (
              <span>
                {questionCounts.byCategory[filters.category]} in selected domain
              </span>
            )}
          </div>
          
          {/* Status breakdown */}
          {!filters.status && (
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
              <span>New: {questionCounts.byStatus.new || 0}</span>
              <span>Practicing: {questionCounts.byStatus.practicing || 0}</span>
              <span>Mastered: {questionCounts.byStatus.mastered || 0}</span>
              <span>Review: {questionCounts.byStatus['needs-review'] || 0}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionFilters;
