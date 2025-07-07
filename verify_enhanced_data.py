#!/usr/bin/env python3
"""
Verification script to check the integrity of the enhanced questions dataset.
"""

import json
import os

def verify_enhanced_data():
    """Verify the enhanced questions data integrity."""
    
    app_dir = "/Users/jeffreyxu/aws-sap-c02-exam-app"
    questions_path = os.path.join(app_dir, "public/data/questions.json")
    
    print("🔍 Verifying Enhanced Questions Dataset")
    print("=" * 50)
    
    # Load questions
    try:
        with open(questions_path, 'r', encoding='utf-8') as f:
            questions = json.load(f)
    except Exception as e:
        print(f"❌ Error loading questions: {e}")
        return False
    
    print(f"✅ Loaded {len(questions)} questions")
    
    # Verify basic structure
    required_fields = ['id', 'question', 'options', 'correct_answer', 'explanation', 'why_correct', 'why_others_wrong']
    enhanced_fields = ['detailed_reasoning', 'aws_services', 'key_concepts']
    
    basic_count = 0
    enhanced_count = 0
    detailed_reasoning_count = 0
    aws_services_count = 0
    key_concepts_count = 0
    
    for question in questions:
        # Check basic fields
        has_basic = all(field in question for field in required_fields)
        if has_basic:
            basic_count += 1
        
        # Check enhanced fields
        has_enhanced = any(field in question for field in enhanced_fields)
        if has_enhanced:
            enhanced_count += 1
        
        # Check specific enhancements
        if 'detailed_reasoning' in question and question['detailed_reasoning']:
            detailed_reasoning_count += 1
        
        if 'aws_services' in question and question['aws_services']:
            aws_services_count += 1
            
        if 'key_concepts' in question and question['key_concepts']:
            key_concepts_count += 1
    
    print(f"✅ Questions with basic structure: {basic_count}/{len(questions)}")
    print(f"✅ Questions with enhancements: {enhanced_count}/{len(questions)}")
    print(f"✅ Questions with detailed reasoning: {detailed_reasoning_count}/{len(questions)}")
    print(f"✅ Questions with AWS services: {aws_services_count}/{len(questions)}")
    print(f"✅ Questions with key concepts: {key_concepts_count}/{len(questions)}")
    
    # Sample detailed reasoning structure
    sample_with_reasoning = None
    for question in questions:
        if 'detailed_reasoning' in question and question['detailed_reasoning']:
            sample_with_reasoning = question
            break
    
    if sample_with_reasoning:
        print(f"\n📋 Sample Enhanced Question (ID: {sample_with_reasoning['id']}):")
        print("-" * 30)
        
        reasoning = sample_with_reasoning['detailed_reasoning']
        if 'option_analyses' in reasoning:
            print(f"   Option analyses: {len(reasoning['option_analyses'])} options")
        
        if 'why_correct_answer_wins' in reasoning:
            print(f"   Correct answer insights: {len(reasoning['why_correct_answer_wins'])}")
        
        if 'common_mistakes' in reasoning:
            print(f"   Common mistakes: {len(reasoning['common_mistakes'])}")
        
        if 'aws_services' in sample_with_reasoning:
            print(f"   AWS services: {len(sample_with_reasoning['aws_services'])}")
        
        if 'key_concepts' in sample_with_reasoning:
            print(f"   Key concepts: {len(sample_with_reasoning['key_concepts'])}")
    
    # Check for duplicate IDs
    ids = [q['id'] for q in questions]
    unique_ids = set(ids)
    
    if len(ids) == len(unique_ids):
        print(f"✅ No duplicate question IDs found")
    else:
        print(f"❌ Found {len(ids) - len(unique_ids)} duplicate IDs")
        return False
    
    # Check ID range
    min_id = min(ids)
    max_id = max(ids)
    print(f"✅ Question ID range: {min_id} to {max_id}")
    
    # Summary
    print(f"\n📊 Enhancement Summary:")
    print(f"   Total questions: {len(questions)}")
    print(f"   Enhanced questions: {enhanced_count} ({enhanced_count/len(questions)*100:.1f}%)")
    print(f"   With detailed reasoning: {detailed_reasoning_count} ({detailed_reasoning_count/len(questions)*100:.1f}%)")
    print(f"   With AWS services: {aws_services_count} ({aws_services_count/len(questions)*100:.1f}%)")
    print(f"   With key concepts: {key_concepts_count} ({key_concepts_count/len(questions)*100:.1f}%)")
    
    print(f"\n🎉 Data verification completed successfully!")
    return True

if __name__ == "__main__":
    verify_enhanced_data()
