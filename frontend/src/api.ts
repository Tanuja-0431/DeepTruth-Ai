const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '/api');

export interface VideoResponse {
  fake_probability: number;
  fake_probability_mean: number;
  fake_probability_max: number;
  result: 'FAKE' | 'REAL' | 'SUSPICIOUS' | 'MINOR AI TRACE';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  frames_processed: number;
  scores: number[];
}

export interface MetricsResponse {
  roc_base64: string | null;
  confusion_base64: string | null;
  distribution_base64: string | null;
  auc_score: number | null;
  confusion_matrix: number[][] | null;
  n_samples: number;
  real_count?: number;
  fake_count?: number;
}

export async function predictVideo(file: File): Promise<VideoResponse> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API_BASE}/predict/video`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getMetrics(): Promise<MetricsResponse> {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function sendContactMessage(data: { name: string; email: string; message: string }): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
