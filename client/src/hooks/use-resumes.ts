import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/queryClient";

export interface Resume {
  id: string;
  userId: string;
  filename: string;
  resumeText: string;
  score: number | null;
  riskLevel: "Low" | "Moderate" | "High" | null;
  analysis: {
    summary: string;
    biasFlags: {
      category: string;
      description: string;
      severity: "Low" | "Moderate" | "High";
      suggestion: string;
    }[];
  } | null;
  createdAt: string;
}

export function useResumes() {
  return useQuery({
    queryKey: [api.resumes.list.path],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const res = await fetch(api.resumes.list.path, { headers });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch resumes");
      return await res.json() as Resume[];
    },
  });
}

export function useResume(id: string) {
  return useQuery({
    queryKey: [api.resumes.get.path, id],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const url = buildUrl(api.resumes.get.path, { id });
      const res = await fetch(url, { headers });
      if (res.status === 404) return null;
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch resume");
      return await res.json() as Resume;
    },
    enabled: !!id,
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { filename: string; text: string }) => {
      const headers = await getAuthHeaders();
      const res = await fetch(api.resumes.upload.path, {
        method: api.resumes.upload.method,
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(data),
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

export function useScanResume() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (file: File) => {
      const headers = await getAuthHeaders();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/scan-resume", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        const error = await res.json();
        throw new Error(error.message || "Failed to scan resume");
      }
      return await res.json() as { score: number; riskLevel: string; flags: string[]; resumeId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.resumes.list.path] });
      toast({
        title: "Scan complete",
        description: `Fairness score: ${data.score}/100`,
      });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Scan failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
