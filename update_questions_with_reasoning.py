#!/usr/bin/env python3
"""
Script to update the existing questions dataset with detailed reasoning from the analysis_reasoning dataset.
This will enhance the existing questions with more comprehensive explanations and reasoning.
"""

import json
import os
from typing import Dict, List, Any

def load_json_file(file_path: str) -> Any:
    """Load JSON data from file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return None

def save_json_file(data: Any, file_path: str) -> bool:
    """Save data to JSON file with proper formatting."""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving {file_path}: {e}")
        return False

def extract_detailed_reasoning(reasoning_question: Dict) -> Dict:
    """Extract and format detailed reasoning from the reasoning dataset."""
    detailed_reasoning = reasoning_question.get('detailed_reasoning', {})
    
    # Extract option analyses
    option_analyses = {}
    for option_analysis in detailed_reasoning.get('option_analyses', []):
        letter = option_analysis.get('letter')
        if letter:
            option_analyses[letter] = {
                'reasoning': option_analysis.get('reasoning', []),
                'key_points': option_analysis.get('key_points', {}),
                'is_correct': option_analysis.get('is_correct', False)
            }
    
    # Extract summary reasoning
    summary_reasoning = detailed_reasoning.get('summary_reasoning', {})
    
    return {
        'option_analyses': option_analyses,
        'summary_reasoning': summary_reasoning,
        'why_correct_answer_wins': summary_reasoning.get('why_correct_answer_wins', []),
        'common_mistakes': summary_reasoning.get('common_mistakes_in_wrong_answers', []),
        'key_concepts': summary_reasoning.get('key_concepts_tested', []),
        'aws_services': summary_reasoning.get('aws_services_involved', [])
    }

def enhance_question_explanation(original_question: Dict, reasoning_question: Dict) -> Dict:
    """Enhance the original question with detailed reasoning."""
    enhanced_question = original_question.copy()
    
    # Extract detailed reasoning
    detailed_reasoning = extract_detailed_reasoning(reasoning_question)
    
    # Update explanation with more detailed information
    if detailed_reasoning['why_correct_answer_wins']:
        enhanced_explanation = f"{original_question.get('explanation', '')}\n\n"
        enhanced_explanation += "Detailed Analysis:\n"
        for reason in detailed_reasoning['why_correct_answer_wins']:
            enhanced_explanation += f"• {reason}\n"
        enhanced_question['explanation'] = enhanced_explanation.strip()
    
    # Enhance why_correct with detailed reasoning
    if detailed_reasoning['option_analyses']:
        correct_letter = reasoning_question.get('correct_answer', '')
        if correct_letter in detailed_reasoning['option_analyses']:
            correct_analysis = detailed_reasoning['option_analyses'][correct_letter]
            enhanced_why_correct = f"{original_question.get('why_correct', '')}\n\n"
            enhanced_why_correct += "Detailed reasoning:\n"
            for reason in correct_analysis['reasoning']:
                enhanced_why_correct += f"• {reason}\n"
            enhanced_question['why_correct'] = enhanced_why_correct.strip()
    
    # Enhance why_others_wrong with specific reasoning for each option
    enhanced_why_others_wrong = []
    for option_letter, analysis in detailed_reasoning['option_analyses'].items():
        if not analysis['is_correct']:
            option_text = f"Option {option_letter}:"
            for reason in analysis['reasoning']:
                option_text += f"\n  • {reason}"
            enhanced_why_others_wrong.append(option_text)
    
    if enhanced_why_others_wrong:
        enhanced_question['why_others_wrong'] = enhanced_why_others_wrong
    
    # Add new fields with detailed reasoning
    enhanced_question['detailed_reasoning'] = detailed_reasoning
    
    # Add AWS services tags if available
    if detailed_reasoning['aws_services']:
        enhanced_question['aws_services'] = detailed_reasoning['aws_services']
    
    # Add key concepts if available
    if detailed_reasoning['key_concepts']:
        enhanced_question['key_concepts'] = detailed_reasoning['key_concepts']
    
    return enhanced_question

def main():
    # File paths
    app_dir = "/Users/jeffreyxu/aws-sap-c02-exam-app"
    reasoning_dir = "/Users/jeffreyxu/analysis_reasoning"
    
    original_questions_path = os.path.join(app_dir, "public/data/questions.json")
    reasoning_questions_path = os.path.join(reasoning_dir, "questions_with_detailed_reasoning.json")
    
    # Backup original questions
    backup_path = os.path.join(app_dir, "public/data/questions_backup_before_reasoning_update.json")
    
    print("Loading datasets...")
    
    # Load original questions
    original_questions = load_json_file(original_questions_path)
    if not original_questions:
        print("Failed to load original questions")
        return
    
    # Load reasoning questions
    reasoning_questions = load_json_file(reasoning_questions_path)
    if not reasoning_questions:
        print("Failed to load reasoning questions")
        return
    
    print(f"Loaded {len(original_questions)} original questions")
    print(f"Loaded {len(reasoning_questions)} reasoning questions")
    
    # Create backup
    if save_json_file(original_questions, backup_path):
        print(f"Created backup at {backup_path}")
    else:
        print("Failed to create backup - aborting")
        return
    
    # Create mapping of reasoning questions by ID
    reasoning_by_id = {q['id']: q for q in reasoning_questions}
    
    # Enhance questions
    enhanced_questions = []
    matched_count = 0
    
    for original_q in original_questions:
        original_id = original_q['id']
        
        if original_id in reasoning_by_id:
            # Enhance with detailed reasoning
            enhanced_q = enhance_question_explanation(original_q, reasoning_by_id[original_id])
            enhanced_questions.append(enhanced_q)
            matched_count += 1
            print(f"Enhanced question {original_id}")
        else:
            # Keep original question as-is
            enhanced_questions.append(original_q)
            print(f"No reasoning data found for question {original_id}")
    
    print(f"\nEnhanced {matched_count} out of {len(original_questions)} questions")
    
    # Add any new questions from reasoning dataset that aren't in original
    original_ids = {q['id'] for q in original_questions}
    new_questions_added = 0
    
    for reasoning_q in reasoning_questions:
        if reasoning_q['id'] not in original_ids:
            # Convert reasoning question to app format
            new_question = {
                'id': reasoning_q['id'],
                'question': reasoning_q['question'],
                'options': reasoning_q['options'],
                'correct_answer': reasoning_q['correct_answer'],
                'topic': reasoning_q.get('topic', 'AWS SAP-C02'),
                'category': reasoning_q.get('category', 'design-solutions'),
                'explanation': reasoning_q.get('explanation', ''),
                'why_correct': reasoning_q.get('why_correct', ''),
                'why_others_wrong': reasoning_q.get('why_others_wrong', [])
            }
            
            # Add detailed reasoning
            enhanced_new_q = enhance_question_explanation(new_question, reasoning_q)
            enhanced_questions.append(enhanced_new_q)
            new_questions_added += 1
            print(f"Added new question {reasoning_q['id']}")
    
    print(f"Added {new_questions_added} new questions from reasoning dataset")
    
    # Sort questions by ID
    enhanced_questions.sort(key=lambda x: x['id'])
    
    # Save enhanced questions
    output_path = os.path.join(app_dir, "public/data/questions_enhanced_with_reasoning.json")
    if save_json_file(enhanced_questions, output_path):
        print(f"\nSaved enhanced questions to {output_path}")
        print(f"Total questions: {len(enhanced_questions)}")
        
        # Also update the main questions file
        if save_json_file(enhanced_questions, original_questions_path):
            print(f"Updated main questions file: {original_questions_path}")
        else:
            print("Failed to update main questions file")
    else:
        print("Failed to save enhanced questions")

if __name__ == "__main__":
    main()
