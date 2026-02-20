import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadResume } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { UploadCloud, FileText, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function Upload() {
  const [text, setText] = useState("");
  const [filename, setFilename] = useState("Manual Entry");
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();
  
  const uploadMutation = useUploadResume();

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setFilename(file.name);
    
    try {
      let extractedText = "";
      
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          extractedText += content.items.map((item: any) => item.str).join(" ") + "\n";
        }
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else if (file.type === "text/plain") {
        extractedText = await file.text();
      }

      setText(extractedText);
    } catch (err) {
      console.error("Extraction error:", err);
      // Fallback or error handling
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    try {
      const result = await uploadMutation.mutateAsync({ filename, text });
      setLocation(`/report/${result.id}`);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold mb-2">Upload Resume</h1>
        <p className="text-muted-foreground">Upload a PDF, DOCX, or paste text to begin auditing.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-2"
        >
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                {isProcessing ? (
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                ) : (
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {isProcessing ? "Extracting text..." : "Click to upload or drag & drop"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, DOCX, or TXT (max 10MB)
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-primary" />
              Resume Content Preview
            </div>
            <div className="text-xs text-muted-foreground">
              {text.length} characters
            </div>
          </div>
          <Textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Or paste resume text here directly..."
            className="min-h-[300px] border-0 focus-visible:ring-0 rounded-none rounded-b-xl resize-none p-6 font-mono text-sm leading-relaxed"
          />
        </Card>
      </motion.div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
        <Button 
          size="lg" 
          onClick={handleSubmit} 
          disabled={!text.trim() || uploadMutation.isPending || isProcessing}
          className="min-w-[150px]"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Analyze Resume"
          )}
        </Button>
      </div>
    </div>
  );
}
