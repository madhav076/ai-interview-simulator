import { api } from "@/lib/axios";
import type { Resume } from "@/types";

/** Shape of what the backend actually returns for a resume document. */
type BackendResume = {
  id?: string;
  _id?: string;
  userId: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
};

/** Normalise a backend resume document to the frontend Resume type. */
function normalise(r: BackendResume): Resume {
  return {
    id: r.id ?? r._id ?? "",
    fileName: r.fileName,
    // fileSize is not returned by the backend — use 0 as a safe default
    fileSize: 0,
    uploadedAt: r.uploadedAt,
  };
}

/**
 * Upload a PDF resume.
 * Backend: POST /api/resume/upload (multipart/form-data, field name "resume")
 */
export async function uploadResume(file: File): Promise<Resume> {
  const form = new FormData();
  form.append("resume", file);

  const { data } = await api.post<{ resume: BackendResume }>(
    "/api/resume/upload",
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return normalise(data.resume);
}

/**
 * Get the most recently uploaded resume for the logged-in user.
 * Backend: GET /api/resume
 * Returns an array of 0 or 1 items so callers can use the list uniformly.
 */
export async function getResumes(): Promise<Resume[]> {
  try {
    const { data } = await api.get<{ resume: BackendResume }>(
      "/api/resume",
    );
    return data.resume ? [normalise(data.resume)] : [];
  } catch (err: unknown) {
    // 404 means no resume uploaded yet — return empty list
    if ((err as { response?: { status?: number } })?.response?.status === 404) {
      return [];
    }
    throw err;
  }
}

/**
 * Delete a resume by ID.
 * NOTE: The current backend does not expose a DELETE /api/resume/:id endpoint.
 * This function is a no-op stub that resolves immediately so callers compile.
 */
export async function deleteResume(_id: string): Promise<void> {
  // Backend endpoint not yet implemented — no-op.
  return Promise.resolve();
}

/**
 * Parse / analyse a resume.
 * NOTE: The current backend does not expose a resume-parse endpoint.
 * Stub maintained for interface compatibility.
 */
export async function parseResume(_id: string): Promise<void> {
  return Promise.resolve();
}
