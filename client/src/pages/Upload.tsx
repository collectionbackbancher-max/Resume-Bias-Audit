import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadResume } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import {
  UploadCloud,
  FileCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Cpu,
  ArrowRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

interface ScanResult {
  score: number;
  riskLevel: string;
  resumeId: number;
  extraction: {
    text: string;
    length: number;
    source: "pdf-parse" | "ocr" | "docx";
  };
}

const SOURCE_LABELS: Record<string, string> = {
  "pdf-parse": "PDF (text-based)",
  ocr: "PDF (OCR — image scan detected)",
  docx: "DOCX",
};

export default function Upload() {
  const [text, setText] = useState("");
  const [filename, setFilename] = useState("Manual Entry");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Upload progress (0–100)
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<
    "idle" | "uploading" | "processing" | "done" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorSuggestion, setErrorSuggestion] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const uploadMutation = useUploadResume();

  // ── Dropzone ──────────────────────────────────────────────────────────────
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setFilename(acceptedFiles[0].name);
      setScanResult(null);
      setErrorMessage(null);
      setErrorSuggestion(null);
      setUploadPhase("idle");
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10 MB
  });

  // ── File scan via axios (with progress) ───────────────────────────────────
  const scanFile = async (file: File) => {
    setErrorMessage(null);
    setErrorSuggestion(null);
    setScanResult(null);
    setUploadProgress(0);
    setUploadPhase("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post<ScanResult>("/api/scan-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
        onUploadProgress: (event) => {
          if (event.total) {
            const pct = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(pct);
            // Once 100% uploaded the server is still processing (OCR can be slow)
            if (pct === 100) setUploadPhase("processing");
          }
        },
      });

      setScanResult(response.data);
      setUploadPhase("done");
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
    } catch (err: any) {
      setUploadPhase("error");
      // Handle structured error response: { error: "...", suggestion: "..." }
      const error = err?.response?.data?.error;
      const suggestion = err?.response?.data?.suggestion;
      if (error) {
        setErrorMessage(error);
        setErrorSuggestion(suggestion || null);
      } else {
        // Fallback for non-structured errors
        setErrorMessage(
          err?.response?.data?.message ||
          err?.message ||
          "Upload failed. Please try again."
        );
        setErrorSuggestion(null);
      }
    }
  };

  // ── Text paste submit ─────────────────────────────────────────────────────
  const submitText = async () => {
    try {
      const result = await uploadMutation.mutateAsync({ filename, text });
      setLocation(`/report/${result.id}`);
    } catch {
      // Handled by mutation hook toast
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      scanFile(selectedFile);
    } else if (text.trim()) {
      submitText();
    }
  };

  const isUploading = uploadPhase === "uploading" || uploadPhase === "processing";
  const isTextPending = uploadMutation.isPending;
  const canSubmit = (selectedFile || text.trim()) && !isUploading && !isTextPending;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold mb-2">Upload Resume</h1>
        <p className="text-muted-foreground">
          Upload a PDF or DOCX to run a deep bias audit powered by AI.
        </p>
      </div>

      {/* ── Drop Zone ── */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <div
          {...getRootProps()}
          className={[
            "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
            isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5",
            selectedFile && uploadPhase !== "error" ? "border-primary bg-primary/5" : "",
          ].join(" ")}
          data-testid="dropzone"
        >
          <input {...getInputProps()} data-testid="input-file" />

          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key="selected"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center">
                  <FileCheck className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {(selectedFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    setScanResult(null);
                    setErrorMessage(null);
                    setErrorSuggestion(null);
                    setUploadPhase("idle");
                    setUploadProgress(0);
                  }}
                  data-testid="button-change-file"
                >
                  <X className="h-3.5 w-3.5" /> Change file
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center">
                  <UploadCloud className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-base">
                    {isDragActive ? "Drop it here…" : "Click to upload or drag & drop"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">PDF or DOCX · max 10 MB</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Progress / Status ── */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
            data-testid="upload-progress"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                {uploadPhase === "uploading"
                  ? `Uploading… ${uploadProgress}%`
                  : "Analyzing for bias (this may take a moment)…"}
              </span>
              {uploadPhase === "uploading" && (
                <span className="text-primary font-medium">{uploadProgress}%</span>
              )}
            </div>
            <Progress
              value={uploadPhase === "processing" ? 100 : uploadProgress}
              className="h-2"
              data-testid="progress-bar"
            />
          </motion.div>
        )}

        {/* ── Error message ── */}
        {uploadPhase === "error" && errorMessage && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive"
            data-testid="status-error"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Upload failed</p>
              <p className="text-sm mt-0.5 opacity-90">{errorMessage}</p>
              {errorSuggestion && (
                <p className="text-sm mt-1.5 opacity-75 italic">💡 {errorSuggestion}</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-destructive hover:text-destructive px-0"
                onClick={() => {
                  setUploadPhase("idle");
                  setErrorMessage(null);
                  setErrorSuggestion(null);
                }}
                data-testid="button-retry"
              >
                Try again
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Extraction preview ── */}
        {uploadPhase === "done" && scanResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
            data-testid="extraction-result"
          >
            {/* Source badge */}
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                    Extraction successful
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {scanResult.extraction.source === "ocr" ? (
                        <Cpu className="h-3.5 w-3.5 text-accent" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 text-primary" />
                      )}
                      <span>
                        Source:{" "}
                        <strong>
                          {SOURCE_LABELS[scanResult.extraction.source] ?? scanResult.extraction.source}
                        </strong>
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground" data-testid="text-extraction-length">
                      {scanResult.extraction.length.toLocaleString()} characters extracted
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OCR notice */}
            {scanResult.extraction.source === "ocr" && (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-accent/10 border border-accent/20 rounded-xl text-sm text-accent-foreground">
                <Cpu className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <p>
                  <strong>OCR was used</strong> — this PDF appeared to be image-based so Tesseract
                  was applied to extract the text. Accuracy may vary for hand-written or low-resolution scans.
                </p>
              </div>
            )}

            {/* Text preview */}
            {scanResult.extraction.text && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Text Preview
                </p>
                <Card className="bg-secondary/40 border-border/60">
                  <CardContent className="p-4">
                    <p
                      className="text-sm font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap break-words"
                      data-testid="text-preview"
                    >
                      {scanResult.extraction.text}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* View report CTA */}
            <div className="flex justify-end">
              <Button
                size="lg"
                className="rounded-full gap-2 shadow-md shadow-primary/20"
                onClick={() => setLocation(`/report/${scanResult.resumeId}`)}
                data-testid="button-view-report"
              >
                View Full Report <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Paste text fallback ── */}
      {!selectedFile && uploadPhase === "idle" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-3 text-muted-foreground">Or paste text directly</span>
            </div>
          </div>

          <Card className="mt-5 border-border/60">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the resume text here…"
              className="min-h-[180px] border-0 focus-visible:ring-0 rounded-xl resize-none p-5 font-mono text-sm leading-relaxed"
              data-testid="textarea-resume-text"
            />
          </Card>
        </motion.div>
      )}

      {/* ── Action buttons (only show when not done) ── */}
      {uploadPhase !== "done" && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isUploading || isTextPending}
            className="rounded-full"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="min-w-[150px] rounded-full shadow-md shadow-primary/20"
            data-testid="button-start-audit"
          >
            {isUploading || isTextPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadPhase === "uploading" ? "Uploading…" : "Analyzing…"}
              </>
            ) : (
              "Start Audit"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
