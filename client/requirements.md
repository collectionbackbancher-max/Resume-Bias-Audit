## Packages
framer-motion | Page transitions and detailed animations
recharts | Visualization for fairness score and bias metrics
lucide-react | Icons for UI elements
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind CSS classes
react-dropzone | File upload drag and drop area
pdfjs-dist | Client-side PDF text extraction
mammoth | Client-side DOCX text extraction

## Notes
Authentication is handled via Replit Auth (useAuth hook provided).
PDF/DOCX text extraction happens client-side to keep the backend simple initially, sending raw text to the API.
Analysis is triggered via a specific endpoint `/api/resumes/:id/analyze`.
