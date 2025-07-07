#!/usr/bin/env python3
"""
Extract complete AWS SAP-C02 questions from PDF source
This script extracts questions with full answer options from the PDF file
"""

import json
import re
import sys
from pathlib import Path

try:
    import PyPDF2
except ImportError:
    print("PyPDF2 not found. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "PyPDF2"])
    import PyPDF2

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
    """Parse questions from extracted text"""
    questions = []
    
    # Split text into potential question blocks
    # Look for patterns like "Question 1", "1.", etc.
    question_pattern = r'(?:Question\s+)?(\d+)\.?\s*([^A-D]*?)(?=A\.|A\))'
    option_pattern = r'([A-D])\.?\s*([^B-D]*?)(?=[B-D]\.|[B-D]\)|$)'
    
    # Find all question blocks
    question_matches = re.finditer(question_pattern, text, re.MULTILINE | re.DOTALL)
    
    for match in question_matches:
        question_id = int(match.group(1))
        question_text = match.group(2).strip()
        
        # Skip if question text is too short (likely parsing error)
        if len(question_text) < 50:
            continue
        
        # Find the options for this question
        # Look for text after this question until the next question
        start_pos = match.end()
        
        # Find next question to limit search scope
        next_question = re.search(r'(?:Question\s+)?(\d+)\.', text[start_pos:])
        if next_question:
            end_pos = start_pos + next_question.start()
            options_text = text[start_pos:end_pos]
        else:
            options_text = text[start_pos:start_pos + 2000]  # Limit to reasonable size
        
        # Extract options A, B, C, D
        options = []
        option_matches = re.finditer(option_pattern, options_text, re.MULTILINE | re.DOTALL)
        
        for opt_match in option_matches:
            letter = opt_match.group(1)
            option_text = opt_match.group(2).strip()
            
            # Clean up option text
            option_text = re.sub(r'\s+', ' ', option_text)
            option_text = option_text.strip()
            
            if option_text and len(option_text) > 5:  # Skip very short options
                options.append({
                    "letter": letter,
                    "text": option_text
                })
        
        # Only include questions with 4 options
        if len(options) == 4:
            # Try to find correct answer (usually marked in some way)
            correct_answer = "A"  # Default, will need manual verification
            
            # Look for answer patterns in the text
            answer_pattern = r'(?:Answer|Correct|Solution):\s*([A-D])'
            answer_match = re.search(answer_pattern, options_text, re.IGNORECASE)
            if answer_match:
                correct_answer = answer_match.group(1)
            
            question_data = {
                "id": question_id,
                "question": question_text,
                "options": options,
                "correct_answer": correct_answer,
                "topic": "AWS SAP-C02",
                "category": determine_category(question_text),
                "explanation": "Extracted from PDF - explanation needs to be added",
                "why_correct": "Correct answer explanation needs to be added",
                "why_others_wrong": [
                    "Incorrect option explanation needs to be added",
                    "Incorrect option explanation needs to be added", 
                    "Incorrect option explanation needs to be added"
                ]
            }
            
            questions.append(question_data)
            print(f"Extracted Question {question_id}: {question_text[:100]}...")
    
    return questions

def determine_category(question_text):
    """Determine question category based on content"""
    categories = {
        "design-solutions": ["architect", "design", "solution", "requirements"],
        "new-solutions": ["new", "implement", "deploy", "create"],
        "continuous-improvement": ["improve", "optimize", "enhance", "performance"],
        "migration-modernization": ["migrate", "modernize", "legacy", "on-premises"]
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
    
    # Check if PDF exists
    if not Path(pdf_path).exists():
        print(f"Error: PDF file not found at {pdf_path}")
        return
    
    try:
        # Extract text from PDF
        text = extract_text_from_pdf(pdf_path)
        
        if not text.strip():
            print("Error: No text extracted from PDF")
            return
        
        print(f"Extracted {len(text)} characters from PDF")
        
        # Save raw text for debugging
        with open("/Users/jeffreyxu/aws-sap-c02-exam-app/pdf_text_raw.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print("Raw text saved to pdf_text_raw.txt for debugging")
        
        # Parse questions
        questions = parse_questions(text)
        
        if not questions:
            print("Error: No questions extracted")
            return
        
        print(f"Successfully extracted {len(questions)} questions")
        
        # Save questions to JSON
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)
        
        print(f"Questions saved to: {output_path}")
        
        # Show sample of first question
        if questions:
            print("\nSample question:")
            print(f"ID: {questions[0]['id']}")
            print(f"Question: {questions[0]['question'][:200]}...")
            print("Options:")
            for opt in questions[0]['options']:
                print(f"  {opt['letter']}: {opt['text'][:100]}...")
        
    except Exception as e:
        print(f"Error during extraction: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
