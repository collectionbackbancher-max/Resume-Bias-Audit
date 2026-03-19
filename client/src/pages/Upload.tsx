import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadResume } from "@/hooks/use-resumes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import {
  UploadCloud, FileCheck, Loader2, AlertCircle, CheckCircle2, FileText,
  ArrowRight, X, Trash2, CheckSquare, AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

interface BulkResult {
  fileName: string;
  status: "success" | "failed";
  scanId?: number;
  biasScore?: number;
  riskLevel?: string;
  error?: string;
  suggestion?: string;
}

interface BulkResponse {
  batchId: string;
  totalFiles: number;
  processed: number;
  failed: number;
  results: BulkResult[];
}

export default function Upload() {
  const [text, setText] = useState("");
  const [filename, setFilename] = useState("Manual Entry");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<"idle" | "uploading" | "processing" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorSuggestion, setErrorSuggestion] = useState<string | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkResponse | null>(null);

  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const uploadMutation = useUploadResume();

  // ── Dropzone accepts multiple files (up to 10) ─────────────────────────────
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const combined = [...selectedFiles, ...acceptedFiles].slice(0, 10);
    setSelectedFiles(combined);
    setErrorMessage(null);
    setErrorSuggestion(null);
    setBulkResults(null);
    setUploadPhase("idle");
  }, [selectedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 10 * 1024 * 1024,
  });

  // ── Bulk scan via axios ────────────────────────────────────────────────────
  const scanFiles = async () => {
    if (selectedFiles.length === 0) return;

    setErrorMessage(null);
    setErrorSuggestion(null);
    setBulkResults(null);
    setUploadProgress(0);
    setUploadPhase("uploading");

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append("files", file));

    const { data: { session } } = await supabase.auth.getSession();
    const authHeader = session?.access_token ? `Bearer ${session.access_token}` : "";

    try {
      const response = await axios.post<BulkResponse>("/api/scan-bulk-resumes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        onUploadProgress: (event) => {
          if (event.total) {
            const pct = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(pct);
            if (pct === 100) setUploadPhase("processing");
          }
        },
      });

      setBulkResults(response.data);
      setUploadPhase("done");
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
    } catch (err: any) {
      setUploadPhase("error");
      const error = err?.response?.data?.error;
      const suggestion = err?.response?.data?.suggestion;
      if (error) {
        setErrorMessage(error);
        setErrorSuggestion(suggestion || null);
      } else {
        setErrorMessage(err?.message || "Upload failed. Please try again.");
        setErrorSuggestion(null);
      }
    }
  };

  // ── Text paste submit ──────────────────────────────────────────────────────
  const submitText = async () => {
    try {
      const result = await uploadMutation.mutateAsync({ filename, text });
      setLocation(`/report/${result.id}`);
    } catch {
      // Handled by mutation hook
    }
  };

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      scanFiles();
    } else if (text.trim()) {
      submitText();
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isUploading = uploadPhase === "uploading" || uploadPhase === "processing";
  const isTextPending = uploadMutation.isPending;
  const canSubmit = (selectedFiles.length > 0 || text.trim()) && !isUploading && !isTextPending;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold mb-2">Upload Resumes</h1>
        <p className="text-muted-foreground">
          Upload up to 10 PDFs or DOCX files for batch bias analysis.
        </p>
      </div>

      {/* Drop Zone */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <div
          {...getRootProps()}
          className={[
            "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
            isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5",
            selectedFiles.length > 0 ? "border-primary bg-primary/5" : "",
          ].join(" ")}
          data-testid="dropzone"
        >
          <input {...getInputProps()} data-testid="input-files" />
          <AnimatePresence mode="wait">
            {selectedFiles.length > 0 ? (
              <motion.div
                key="selected"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center">
                  <CheckSquare className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-base">{selectedFiles.length} file(s) selected</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {(selectedFiles.reduce((s, f) => s + f.size, 0) / 1024).toFixed(0)} KB total
                  </p>
                </div>
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
                    {isDragActive ? "Drop files here…" : "Click to upload or drag & drop"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">PDF or DOCX · max 10 MB each, up to 10 files</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* File list */}
      <AnimatePresence>
        {selectedFiles.length > 0 && uploadPhase === "idle" && (
          <motion.div
            key="filelist"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-sm mb-3">Files to upload</h3>
                <div className="space-y-2">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg" data-testid={`file-item-${i}`}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(i)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-remove-file-${i}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress / Status */}
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
                  : "Analyzing resumes for bias (this may take a moment)…"}
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

        {/* Error message */}
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

        {/* Bulk results */}
        {uploadPhase === "done" && bulkResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
            data-testid="bulk-results"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-secondary/50 p-4 rounded-xl text-center">
                      <p className="text-sm text-muted-foreground mb-1">Total Files</p>
                      <p className="text-2xl font-bold">{bulkResults.totalFiles}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center border border-green-200">
                      <p className="text-sm text-green-700 font-medium mb-1">Processed</p>
                      <p className="text-2xl font-bold text-green-700">{bulkResults.processed}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl text-center border border-red-200">
                      <p className="text-sm text-red-700 font-medium mb-1">Failed</p>
                      <p className="text-2xl font-bold text-red-700">{bulkResults.failed}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {bulkResults.results.map((result, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg border ${
                          result.status === "success"
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                        data-testid={`result-${i}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {result.status === "success" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{result.fileName}</p>
                              {result.status === "success" ? (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Score: <span className="font-bold text-green-700">{result.biasScore}</span> · {result.riskLevel} Risk
                                </p>
                              ) : (
                                <p className="text-xs text-red-700 mt-0.5">{result.error}</p>
                              )}
                            </div>
                          </div>
                          {result.status === "success" && result.scanId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setLocation(`/report/${result.scanId}`)}
                              className="ml-2"
                              data-testid={`button-view-${i}`}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedFiles([]);
                      setBulkResults(null);
                      setUploadPhase("idle");
                    }}
                    className="w-full"
                    data-testid="button-upload-more"
                  >
                    Upload More Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text paste fallback */}
      {selectedFiles.length === 0 && uploadPhase === "idle" && (
        <div className="border-t pt-8">
          <h2 className="text-xl font-bold font-display mb-4">Or paste resume text</h2>
          <div className="space-y-3">
            <Textarea
              placeholder="Paste resume content here…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-32"
              data-testid="textarea-paste"
            />
          </div>
        </div>
      )}

      {/* Submit button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-3"
      >
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          size="lg"
          className="flex-1 gap-2"
          data-testid="button-submit"
        >
          {selectedFiles.length > 0 ? `Scan ${selectedFiles.length} File(s)` : "Scan Resume"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
}
