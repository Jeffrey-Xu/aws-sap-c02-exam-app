import type { Question, ExamDomain, QuestionFilters } from '../types';
import { DOMAIN_KEYWORDS } from '../constants';

export function safePercentage(numerator: number, denominator: number): number {
  if (!numerator || !denominator || denominator === 0 || !isFinite(numerator) || !isFinite(denominator)) {
    return 0;
  }
  const result = (numerator / denominator) * 100;
  return isFinite(result) ? Math.round(result) : 0;
}

export function safeNumber(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number' && isFinite(value)) {
    return value;
  }
  return defaultValue;
}

export function categorizeQuestion(question: Question): ExamDomain {
  // Map data categories to proper ExamDomains
  if (question.category) {
    switch (question.category as string) {
      case 'design-solutions':
        // Distribute design-solutions questions across domains based on content
        return categorizeDesignSolutionQuestion(question);
      case 'new-solutions':
        return 'new-solutions';
      case 'continuous-improvement':
        return 'continuous-improvement';
      default:
        // If category exists but doesn't match, fall through to content analysis
        break;
    }
  }
  
  // Content-based categorization for questions without proper categories
  return categorizeByContent(question);
}

function categorizeDesignSolutionQuestion(question: Question): ExamDomain {
  const questionText = question.question.toLowerCase();
  const optionsText = question.options.map(opt => opt.text.toLowerCase()).join(' ');
  const explanationText = (question.explanation || '').toLowerCase();
  const fullText = `${questionText} ${optionsText} ${explanationText}`;
  
  // Organizational Complexity indicators (highest priority)
  if (fullText.match(/\b(organization|organizations|account|accounts|cross-account|multi-account|scp|service control policy|ou|organizational unit|consolidated billing|master account|member account|aws organizations)\b/gi)) {
    return 'organizational-complexity';
  }
  
  // Migration Planning indicators
  if (fullText.match(/\b(migrate|migration|hybrid|on-premises|on-premise|legacy|moderniz|datacenter|data center|aws migration|database migration|application migration|lift and shift|rehost|replatform|refactor)\b/gi)) {
    return 'migration-planning';
  }
  
  // Cost Control indicators
  if (fullText.match(/\b(cost|costs|pricing|budget|billing|reserved instance|savings plan|spot instance|cost optimization|cost-effective|cheapest|least expensive|minimize cost|reduce cost)\b/gi)) {
    return 'cost-control';
  }
  
  // Continuous Improvement indicators
  if (fullText.match(/\b(monitor|monitoring|cloudwatch|alarm|metric|log|logging|cloudtrail|performance|optimize|optimization|troubleshoot|debug|alert|notification)\b/gi)) {
    return 'continuous-improvement';
  }
  
  // Default to new-solutions for design questions that don't fit other categories
  return 'new-solutions';
}

function categorizeByContent(question: Question): ExamDomain {
  const questionText = question.question.toLowerCase();
  const optionsText = question.options.map(opt => opt.text.toLowerCase()).join(' ');
  const explanationText = (question.explanation || '').toLowerCase();
  const fullText = `${questionText} ${optionsText} ${explanationText}`;
  
  const domainScores: Record<ExamDomain, number> = {
    'organizational-complexity': 0,
    'migration-planning': 0,
    'cost-control': 0,
    'continuous-improvement': 0,
    'new-solutions': 0
  };
  
  // Score each domain based on keyword matches with weighted scoring
  Object.entries(DOMAIN_KEYWORDS).forEach(([domain, keywords]) => {
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = fullText.match(regex);
      if (matches) {
        // Weight longer, more specific keywords higher
        const weight = keyword.length > 10 ? 3 : keyword.length > 5 ? 2 : 1;
        domainScores[domain as ExamDomain] += matches.length * weight;
      }
    });
  });
  
  // Enhanced fallback logic with specific patterns
  const hasStrongIndicators = Object.values(domainScores).some(score => score >= 3);
  
  if (!hasStrongIndicators) {
    // Organizational Complexity indicators
    if (fullText.match(/\b(account|accounts|organization|cross-account|multi-account|scp|ou|organizational unit)\b/gi)) {
      domainScores['organizational-complexity'] += 5;
    }
    
    // Migration Planning indicators
    if (fullText.match(/\b(migrate|migration|hybrid|on-premises|on-premise|legacy|moderniz|datacenter|data center)\b/gi)) {
      domainScores['migration-planning'] += 5;
    }
    
    // Cost Control indicators
    if (fullText.match(/\b(cost|costs|pricing|price|budget|billing|cheapest|lowest cost|expensive|save money|financial)\b/gi)) {
      domainScores['cost-control'] += 5;
    }
    
    // Continuous Improvement indicators
    if (fullText.match(/\b(performance|monitor|security|optimize|improve|enhance|efficient|reliable|available)\b/gi)) {
      domainScores['continuous-improvement'] += 5;
    }
    
    // New Solutions indicators (more specific now)
    if (fullText.match(/\b(microservice|serverless|container|kubernetes|event-driven|decouple|loosely coupled)\b/gi)) {
      domainScores['new-solutions'] += 5;
    }
  }
  
  // Find domain with highest score
  const sortedDomains = Object.entries(domainScores)
    .sort(([,a], [,b]) => b - a);
  
  const [bestDomain, bestScore] = sortedDomains[0];
  const [secondDomain, secondScore] = sortedDomains[1] || ['', 0];
  
  // If there's a clear winner (score difference > 2), use it
  if (bestScore > secondScore + 2) {
    return bestDomain as ExamDomain;
  }
  
  // If scores are close, use contextual logic
  if (bestScore > 0) {
    // Check for specific service mentions that indicate domain
    if (fullText.includes('organizations') || fullText.includes('control tower')) {
      return 'organizational-complexity';
    }
    if (fullText.includes('migration') || fullText.includes('dms') || fullText.includes('snowball')) {
      return 'migration-planning';
    }
    if (fullText.includes('reserved instance') || fullText.includes('spot instance') || fullText.includes('savings plan')) {
      return 'cost-control';
    }
    if (fullText.includes('cloudwatch') || fullText.includes('cloudtrail') || fullText.includes('config')) {
      return 'continuous-improvement';
    }
    
    return bestDomain as ExamDomain;
  }
  
  // Final fallback based on question structure and common patterns
  if (fullText.includes('company') && fullText.includes('requirement')) {
    // Most SAP-C02 questions start this way, analyze the core requirement
    if (fullText.match(/\b(multiple accounts|billing|organization)\b/gi)) {
      return 'organizational-complexity';
    }
    if (fullText.match(/\b(move|transfer|existing|current|on-premises)\b/gi)) {
      return 'migration-planning';
    }
    if (fullText.match(/\b(reduce cost|minimize cost|cost-effective|budget)\b/gi)) {
      return 'cost-control';
    }
    if (fullText.match(/\b(improve|optimize|monitor|secure|reliable)\b/gi)) {
      return 'continuous-improvement';
    }
  }
  
  // If still no clear category, distribute more evenly instead of defaulting to new-solutions
  const questionId = question.id;
  const distributionMap = [
    'organizational-complexity',
    'migration-planning', 
    'cost-control',
    'continuous-improvement',
    'new-solutions'
  ];
  
  return distributionMap[questionId % 5] as ExamDomain;
}

export function analyzeQuestionDistribution(questions: Question[]): Record<ExamDomain, number> {
  const distribution: Record<ExamDomain, number> = {
    'organizational-complexity': 0,
    'migration-planning': 0,
    'cost-control': 0,
    'continuous-improvement': 0,
    'new-solutions': 0
  };
  
  questions.forEach(question => {
    const category = categorizeQuestion(question);
    distribution[category]++;
  });
  
  return distribution;
}

export function debugCategorization(questions: Question[], sampleSize: number = 10) {
  console.log('=== Question Categorization Debug ===');
  
  const distribution = analyzeQuestionDistribution(questions);
  console.log('Distribution:', distribution);
  
  const total = questions.length;
  console.log('Percentages:');
  Object.entries(distribution).forEach(([domain, count]) => {
    console.log(`${domain}: ${count} (${Math.round((count/total)*100)}%)`);
  });
  
  console.log('\nSample categorizations:');
  questions.slice(0, sampleSize).forEach(question => {
    const category = categorizeQuestion(question);
    console.log(`Q${question.id}: ${category}`);
    console.log(`Text: ${question.question.substring(0, 100)}...`);
    console.log('---');
  });
}

export function validateQuestion(question: Question): string[] {
  const errors: string[] = [];
  
  // Check if correct answer references valid options
  const correctAnswers = parseCorrectAnswers(question.correct_answer);
  const availableOptions = question.options.map(opt => opt.letter as string);
  
  correctAnswers.forEach(answer => {
    if (!availableOptions.includes(answer)) {
      errors.push(`Correct answer '${answer}' not found in available options`);
    }
  });
  
  // Check for duplicate options
  const optionLetters = question.options.map(opt => opt.letter);
  const duplicates = optionLetters.filter((letter, index) => optionLetters.indexOf(letter) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate options found: ${duplicates.join(', ')}`);
  }
  
  // Check for empty option text
  question.options.forEach(opt => {
    if (!opt.text || opt.text.trim().length === 0) {
      errors.push(`Option ${opt.letter} has empty text`);
    }
  });
  
  // Check for placeholder text (indicates incomplete data)
  question.options.forEach(opt => {
    if (opt.text.includes('[Option') && opt.text.includes('needs to be added')) {
      errors.push(`Option ${opt.letter} has placeholder text - needs real content`);
    }
  });
  
  return errors;
}

export function validateAllQuestions(questions: Question[]): Record<number, string[]> {
  const validationResults: Record<number, string[]> = {};
  
  questions.forEach(question => {
    const errors = validateQuestion(question);
    if (errors.length > 0) {
      validationResults[question.id] = errors;
    }
  });
  
  return validationResults;
}

export function filterQuestions(
  questions: Question[], 
  filters: QuestionFilters, 
  questionProgress?: Record<number, any>
): Question[] {
  return questions.filter(question => {
    if (filters.category && categorizeQuestion(question) !== filters.category) {
      return false;
    }
    
    if (filters.bookmarked && questionProgress) {
      const progress = questionProgress[question.id];
      if (!progress || !progress.bookmarked) {
        return false;
      }
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const questionText = question.question.toLowerCase();
      const optionsText = question.options.map(opt => opt.text.toLowerCase()).join(' ');
      
      if (!questionText.includes(searchTerm) && !optionsText.includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomQuestions(questions: Question[], count: number): Question[] {
  const shuffled = shuffleArray(questions);
  return shuffled.slice(0, count);
}

export function getQuestionsWithDomainRatio(questions: Question[], totalCount: number): Question[] {
  // Official AWS SAP-C02 exam domain percentages
  const domainRatios = {
    'new-solutions': 0.29, // 29%
    'organizational-complexity': 0.26, // 26%
    'continuous-improvement': 0.25, // 25%
    'cost-control': 0.12, // 12%
    'migration-planning': 0.08 // 8%
  };

  // Group questions by domain
  const questionsByDomain: Record<string, Question[]> = {};
  questions.forEach(question => {
    const domain = question.category || 'other';
    if (!questionsByDomain[domain]) {
      questionsByDomain[domain] = [];
    }
    questionsByDomain[domain].push(question);
  });

  const selectedQuestions: Question[] = [];
  
  // Calculate target count for each domain
  Object.entries(domainRatios).forEach(([domain, ratio]) => {
    const targetCount = Math.round(totalCount * ratio);
    const availableQuestions = questionsByDomain[domain] || [];
    
    if (availableQuestions.length > 0) {
      // Shuffle and select questions for this domain
      const shuffled = shuffleArray(availableQuestions);
      const selected = shuffled.slice(0, Math.min(targetCount, shuffled.length));
      selectedQuestions.push(...selected);
    }
  });

  // If we don't have enough questions, fill with random questions from any domain
  if (selectedQuestions.length < totalCount) {
    const remainingCount = totalCount - selectedQuestions.length;
    const usedIds = new Set(selectedQuestions.map(q => q.id));
    const remainingQuestions = questions.filter(q => !usedIds.has(q.id));
    
    if (remainingQuestions.length > 0) {
      const shuffled = shuffleArray(remainingQuestions);
      selectedQuestions.push(...shuffled.slice(0, remainingCount));
    }
  }

  // Final shuffle to randomize order while maintaining the ratio
  return shuffleArray(selectedQuestions);
}

export function isMultipleChoice(correctAnswer: string): boolean {
  return correctAnswer.length > 1 && /^[A-F]+$/.test(correctAnswer);
}

export function parseCorrectAnswers(correctAnswer: string): string[] {
  return correctAnswer.split('').filter(letter => /^[A-F]$/.test(letter));
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function calculateReadinessScore(
  totalQuestions: number,
  masteredQuestions: number,
  categoryProgress: Record<ExamDomain, { mastered: number; total: number }>
): number {
  // Safe calculations to prevent NaN
  const safeTotalQuestions = safeNumber(totalQuestions, 1);
  const safeMasteredQuestions = safeNumber(masteredQuestions, 0);
  const overallMastery = safeMasteredQuestions / safeTotalQuestions;
  
  const domainReadiness = Object.values(categoryProgress).map(progress => {
    const safeTotal = safeNumber(progress.total, 1);
    const safeMastered = safeNumber(progress.mastered, 0);
    return safeTotal > 0 ? safeMastered / safeTotal : 0;
  });
  
  const averageDomainReadiness = domainReadiness.length > 0 
    ? domainReadiness.reduce((a, b) => a + b, 0) / domainReadiness.length 
    : 0;
  
  // Weighted calculation: 60% overall mastery + 40% domain balance
  const result = (overallMastery * 0.6 + averageDomainReadiness * 0.4) * 100;
  return Math.round(isFinite(result) ? result : 0);
}
