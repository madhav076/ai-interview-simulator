import { api } from "@/lib/axios";

export interface InterviewRecord {
  _id: string;
  role: string;
  topic: string;
  difficulty: string;
  score?: number;
  createdAt: string;
}

export const getAllInterviews = async (): Promise<InterviewRecord[]> => {
  const response = await api.get("/api/interview");
  return (response.data.interviews || []).map((i: any) => ({
    _id: i._id,
    role: i.jobRole || i.role || "Standard Interview",
    topic: i.title || i.topic || "AI assessment",
    difficulty: i.difficulty,
    score: i.score,
    createdAt: i.createdAt,
  }));
};

export const downloadReportPdf = async (interviewId: string, role: string) => {
  try {
    const response = await api.get(`/api/report/${interviewId}/pdf`, {
      responseType: "blob", // Important for downloading files
    });
    
    // Create a temporary link element to trigger the download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Interview_Report_${role}_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download PDF report:", error);
    throw error;
  }
};
