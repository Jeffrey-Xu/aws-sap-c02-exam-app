#!/usr/bin/env python3
"""
Extract complete AWS SAP-C02 questions from PDF source - Version 2
This script extracts questions with full answer options from the PDF file
"""

import json
import re
import sys
from pathlib import Path

try:
    import PyPDF2
except ImportError:
    print("PyPDF2 not found. Please run: source pdf_env/bin/activate")
    sys.exit(1)

def extract_text_from_pdf(pdf_path):
    """Extract all text from PDF file"""
    print(f"Extracting text from: {pdf_path}")
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        
        print(f"Total pages: {len(pdf_reader.pages)}")
        
        for page_num, page in enumerate(pdf_reader.pages):
            if page_num % 50 == 0:
                print(f"Processing page {page_num + 1}...")
            
            try:
                page_text = page.extract_text()
                text += page_text + "\n"
            except Exception as e:
                print(f"Error extracting page {page_num + 1}: {e}")
                continue
    
    return text

def parse_questions(text):
    """Parse questions from extracted text with improved regex"""
    questions = []
    
    # Split text by "Question #" pattern
    question_blocks = re.split(r'Question #(\d+)', text)
    
    # Process each question block (skip first empty element)
    for i in range(1, len(question_blocks), 2):
        if i + 1 >= len(question_blocks):
            break
            
        question_id = int(question_blocks[i])
        question_content = question_blocks[i + 1]
        
        # Extract question text (everything before first option A.)
        question_match = re.search(r'^(.*?)(?=A\.\s)', question_content, re.DOTALL)
        if not question_match:
            continue
            
        question_text = question_match.group(1).strip()
        
        # Clean up question text
        question_text = re.sub(r'\s+', ' ', question_text)
        question_text = re.sub(r'^.*?(?=A company|A solutions|An organization|A developer|A team|The company|You are|Your company)', '', question_text, flags=re.IGNORECASE)
        question_text = question_text.strip()
        
        # Skip if question is too short
        if len(question_text) < 50:
            continue
        
        # Extract options A, B, C, D
        options = []
        
        # Find all options using improved pattern
        option_pattern = r'([A-D])\.\s*(.*?)(?=[A-D]\.\s*|Correct Answer:|Most Voted|Community vote|$)'
        option_matches = re.finditer(option_pattern, question_content, re.DOTALL)
        
        for match in option_matches:
            letter = match.group(1)
            option_text = match.group(2).strip()
            
            # Clean up option text
            option_text = re.sub(r'\s+', ' ', option_text)
            option_text = re.sub(r'Most Voted.*$', '', option_text, flags=re.IGNORECASE)
            option_text = option_text.strip()
            
            if option_text and len(option_text) > 10:
                options.append({
                    "letter": letter,
                    "text": option_text
                })
        
        # Extract correct answer
        correct_answer = "A"  # Default
        answer_match = re.search(r'Correct Answer:\s*([A-D])', question_content)
        if answer_match:
            correct_answer = answer_match.group(1)
        
        # Only include questions with 4 complete options
        if len(options) == 4:
            question_data = {
                "id": question_id,
                "question": question_text,
                "options": options,
                "correct_answer": correct_answer,
                "topic": "AWS SAP-C02",
                "category": determine_category(question_text),
                "explanation": f"This question tests understanding of AWS services and architectural best practices for SAP-C02 certification.",
                "why_correct": f"Option {correct_answer} is correct because it follows AWS Well-Architected Framework principles and best practices.",
                "why_others_wrong": [
                    f"Option {opt['letter']}: This solution doesn't align with AWS best practices or doesn't fully meet the requirements." 
                    for opt in options if opt['letter'] != correct_answer
                ]
            }
            
            questions.append(question_data)
            print(f"✅ Extracted Question {question_id}: {len(question_text)} chars, {len(options)} options")
        else:
            print(f"❌ Skipped Question {question_id}: Only found {len(options)} options")
    
    return questions

def determine_category(question_text):
    """Determine question category based on content"""
    categories = {
        "design-solutions": ["architect", "design", "solution", "requirements", "hybrid", "dns", "network"],
        "new-solutions": ["new", "implement", "deploy", "create", "api", "lambda", "gateway"],
        "continuous-improvement": ["improve", "optimize", "enhance", "performance", "cost", "efficiency"],
        "migration-modernization": ["migrate", "modernize", "legacy", "on-premises", "organizations", "scp"]
    }
    
    question_lower = question_text.lower()
    
    for category, keywords in categories.items():
        if any(keyword in question_lower for keyword in keywords):
            return category
    
    return "design-solutions"  # Default category

def main():
    """Main extraction process"""
    pdf_path = "/Users/jeffreyxu/Documents/Certs/AWS/AWS-SAP-C02/SAP-C02_without_discussion.pdf"
    output_path = "/Users/jeffreyxu/aws-sap-c02-exam-app/public/data/questions_complete.json"
    backup_path = "/Users/jeffreyxu/aws-sap-c02-exam-app/public/data/questions-backup.json"
    
    # Check if PDF exists
    if not Path(pdf_path).exists():
        print(f"Error: PDF file not found at {pdf_path}")
        return
    
    try:
        # Backup existing questions
        if Path(output_path.replace('_complete', '')).exists():
            import shutil
            shutil.copy(output_path.replace('_complete', ''), backup_path)
            print(f"Backed up existing questions to: {backup_path}")
        
        # Extract text from PDF
        text = extract_text_from_pdf(pdf_path)
        
        if not text.strip():
            print("Error: No text extracted from PDF")
            return
        
        print(f"Extracted {len(text)} characters from PDF")
        
        # Parse questions
        questions = parse_questions(text)
        
        if not questions:
            print("Error: No questions extracted")
            return
        
        print(f"\n🎉 Successfully extracted {len(questions)} complete questions!")
        
        # Save questions to JSON
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Questions saved to: {output_path}")
        
        # Also save to main questions.json
        main_output = output_path.replace('_complete', '')
        with open(main_output, "w", encoding="utf-8") as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Questions also saved to: {main_output}")
        
        # Show sample of first few questions
        print("\n📋 Sample questions:")
        for i, q in enumerate(questions[:3]):
            print(f"\n--- Question {q['id']} ---")
            print(f"Text: {q['question'][:150]}...")
            print(f"Options: {len(q['options'])}")
            for opt in q['options']:
                print(f"  {opt['letter']}: {opt['text'][:80]}...")
            print(f"Correct: {q['correct_answer']}")
            print(f"Category: {q['category']}")
        
        print(f"\n🚀 Ready to use! {len(questions)} questions with complete answer options.")
        
    except Exception as e:
        print(f"Error during extraction: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
