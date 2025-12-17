"""
Script to extract Route 1 data from pages 26-28 of the PDF
"""
import PyPDF2
import re
from pathlib import Path

def extract_route_from_pdf(pdf_path, start_page=25, end_page=27):  # 0-indexed, so page 26 = index 25
    """Extract Route 1 data from PDF pages 26-28"""
    route_data = {
        'from': '',
        'to': '',
        'centers': []
    }
    
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Extract text from pages 26-28 (indices 25-27)
            text = ''
            for page_num in range(start_page, min(end_page + 1, len(pdf_reader.pages))):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + '\n'
            
            print("Extracted text from pages 26-28:")
            print("=" * 80)
            print(text)
            print("=" * 80)
            
            # Try to parse the route data
            # This is a basic parser - you may need to adjust based on PDF structure
            lines = text.split('\n')
            for i, line in enumerate(lines):
                line = line.strip()
                if 'Route' in line and '1' in line:
                    # Found Route 1
                    print(f"Found Route 1 at line {i}: {line}")
                # Add more parsing logic here based on actual PDF structure
            
    except Exception as e:
        print(f"Error reading PDF: {e}")
    
    return route_data

if __name__ == '__main__':
    pdf_path = Path(__file__).parent.parent / 'frontend' / 'gujrat_vihar_margdarshika.pdf'
    if pdf_path.exists():
        extract_route_from_pdf(pdf_path)
    else:
        print(f"PDF not found at: {pdf_path}")

