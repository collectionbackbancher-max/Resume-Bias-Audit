import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Types derived from API response schemas would ideally be imported, 
// but we'll use the shapes defined in the Zod schemas for now.
export interface Resume {
  id: number;
  userId: string;
  filename: string;
  rawText: string;
  score: number | null;
  riskLevel: "Low" | "Moderate" | "High" | null;
  analysis: {
    summary: string;
    biasFlags: { 
      category: string; 
      description: string; 
      severity: "Low" | "Moderate" | "High"; 
      suggestion: string 
    }[];
  } | null;
  createdAt: string;
}

export function useResumes() {
  return useQuery({
    queryKey: [api.resumes.list.path],
    queryFn: async () => {
      const res = await fetch(api.resumes.list.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch resumes");
      // Parsing logic matches API response schema
      return await res.json() as Resume[];
    },
  });
}

export function useResume(id: number) {
  return useQuery({
    queryKey: [api.resumes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.resumes.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch resume");
      return await res.json() as Resume;
    },
    enabled: !isNaN(id),
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { filename: string; text: string }) => {
      const res = await fetch(api.resumes.upload.path, {
        method: api.resumes.upload.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const error = await res.json();
        throw new Error(error.message || "Failed to upload resume");
      }
      return await res.json() as Resume;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume is ready for analysis.",
      });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useAnalyzeResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.resumes.analyze.path, { id });
      const res = await fetch(url, {
        method: api.resumes.analyze.method,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const error = await res.json();
        throw new Error(error.message || "Analysis failed");
      }
      return await res.json() as Resume;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.get.path, data.id] });
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      toast({
        title: "Analysis complete",
        description: "Your resume bias report is ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
