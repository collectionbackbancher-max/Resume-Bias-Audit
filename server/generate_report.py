from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import sys
import json
from datetime import datetime

def generate_pdf(data_json, output_path):
    data = json.loads(data_json)
    
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1
    )
    story.append(Paragraph("BiasAudit.ai - Resume Analysis Report", title_style))
    story.append(Spacer(1, 12))

    # Basic Info
    story.append(Paragraph(f"<b>Filename:</b> {data.get('filename', 'Unknown')}", styles['Normal']))
    story.append(Paragraph(f"<b>Timestamp:</b> {data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))}", styles['Normal']))
    story.append(Spacer(1, 12))

    # Scores
    score_data = [
        ["Metric", "Value"],
        ["Overall Fairness Score", f"{data.get('score', 0)}/100"],
        ["Risk Level", data.get('riskLevel', 'N/A')]
    ]
    
    table = Table(score_data, colWidths=[200, 200])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(table)
    story.append(Spacer(1, 24))

    # Flagged Words & Suggestions
    story.append(Paragraph("Detailed Bias Findings", styles['Heading2']))
    story.append(Spacer(1, 12))
    
    flags = data.get('analysis', {}).get('biasFlags', [])
    if not flags:
        story.append(Paragraph("No significant bias markers detected.", styles['Normal']))
    else:
        for flag in flags:
            story.append(Paragraph(f"<b>Category:</b> {flag.get('category', 'General')}", styles['Normal']))
            story.append(Paragraph(f"<b>Description:</b> {flag.get('description', 'N/A')}", styles['Normal']))
            story.append(Paragraph(f"<b>Severity:</b> {flag.get('severity', 'Low')}", styles['Normal']))
            story.append(Paragraph(f"<b>AI Suggestion:</b> {flag.get('suggestion', '[Placeholder: Consider using more inclusive language]')}", styles['Normal']))
            story.append(Spacer(1, 12))

    # Disclaimer
    story.append(Spacer(1, 48))
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=1
    )
    disclaimer_text = "Legal Disclaimer: This tool provides bias risk indicators only and does not determine protected attributes."
    story.append(Paragraph(disclaimer_text, disclaimer_style))

    doc.build(story)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_report.py <json_data> <output_path>")
        sys.exit(1)
    
    generate_pdf(sys.argv[1], sys.argv[2])
