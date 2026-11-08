import { auth } from "./firebase";

const API_BASE = "https://seedo-fret-backend.vercel.app";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface FastApiErrorDetail {
  msg: string;
}

async function authHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function parseErrorMessage(res: Response): Promise<string> {
  let message = `Erreur ${res.status}`;
  try {
    const data = await res.json();
    // FastAPI renvoie soit {"detail": "message"} soit, pour une erreur de
    // validation Pydantic, {"detail": [{"msg": "..."}, ...]}.
    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (Array.isArray(data?.detail)) {
      message = (data.detail as FastApiErrorDetail[]).map(d => d.msg).join(", ");
    }
  } catch {
    // corps non-JSON (ou vide) — on garde le message générique
  }
  return message;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(await authHeader()),
    ...(options.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res));
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** Pour les uploads multipart — ne force pas Content-Type (le navigateur
 * doit fixer lui-même la boundary), pas de JSON.stringify du corps. */
async function requestForm<T>(path: string, formData: FormData): Promise<T> {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body: formData });
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res));
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

/** Pour récupérer un fichier (document privé) en tant que Blob téléchargeable/affichable. */
async function requestBlob(path: string): Promise<Blob> {
  const headers = await authHeader();
  const res = await fetch(`${API_BASE}${path}`, { headers });
  if (!res.ok) throw new ApiError(res.status, await parseErrorMessage(res));
  return res.blob();
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  postForm: <T>(path: string, formData: FormData) => requestForm<T>(path, formData),
  getBlob: (path: string) => requestBlob(path),
};
