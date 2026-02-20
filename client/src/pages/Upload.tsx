import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadResume, useScanResume } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { UploadCloud, FileText, Loader2, AlertCircle, FileCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Upload() {
  const [text, setText] = useState("");
  const [filename, setFilename] = useState("Manual Entry");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [, setLocation] = useLocation();
  
  const uploadMutation = useUploadResume();
  const scanMutation = useScanResume();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setFilename(acceptedFiles[0].name);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const handleSubmit = async () => {
    if (selectedFile) {
      try {
        const result = await scanMutation.mutateAsync(selectedFile);
        setLocation(`/report/${result.resumeId}`);
      } catch (error) {
        // Error handled by mutation hook
      }
    } else if (text.trim()) {
      try {
        const result = await uploadMutation.mutateAsync({ filename, text });
        setLocation(`/report/${result.id}`);
      } catch (error) {
        // Error handled by mutation hook
      }
    }
  };

  const isUploading = uploadMutation.isPending || scanMutation.isPending;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold mb-2">Upload Resume</h1>
        <p className="text-muted-foreground">Upload a PDF or DOCX file to perform a deep bias audit.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all relative overflow-hidden
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              ${selectedFile ? 'border-primary bg-primary/5' : ''}
            `}
          >
            <input {...getInputProps()} />
            <AnimatePresence mode="wait">
              {selectedFile ? (
                <motion.div 
                  key="selected"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <FileCheck className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedFile.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to scan
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2 text-primary" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setFilename("Manual Entry");
                    }}>
                      Change file
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Click to upload or drag & drop</h3>
                    <p className="text-sm text-muted-foreground mt-1">PDF or DOCX (max 10MB)</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {!selectedFile && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-muted"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
            </div>
          </div>
          
          <Card className="mt-6">
            <Textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste resume text here directly..."
              className="min-h-[200px] border-0 focus-visible:ring-0 rounded-xl resize-none p-6 font-mono text-sm leading-relaxed"
            />
          </Card>
        </motion.div>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => window.history.back()} disabled={isUploading}>Cancel</Button>
        <Button 
          size="lg" 
          onClick={handleSubmit} 
          disabled={(!text.trim() && !selectedFile) || isUploading}
          className="min-w-[150px] rounded-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            "Start Audit"
          )}
        </Button>
      </div>
    </div>
  );
}
