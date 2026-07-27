const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthToken() {
  return localStorage.getItem('civicmitra:token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  return response.text() as unknown as T;
}

export const api = {
  getChallenges: () => request<any[]>('/challenges'),
  getAdminChallenges: () => request<any[]>('/admin/challenges'),
  getEvents: () => request<any[]>('/events'),
  getQuizQuestions: () => request<any[]>('/quiz-questions'),
  getAdminQuizQuestions: () => request<any[]>('/admin/quiz-questions'),
  submitCompletion: (payload: unknown) => request('/completions', { method: 'POST', body: JSON.stringify(payload) }),
  getCompletions: (userId: string) => request<any[]>(`/completions/${userId}`),
  saveQuizAttempt: (payload: unknown) => request('/quiz-attempts', { method: 'POST', body: JSON.stringify(payload) }),
  syncProfile: (payload: unknown) => request('/auth/profile', { method: 'POST', body: JSON.stringify(payload) }),
  registerEvent: (payload: unknown) => request('/events/register', { method: 'POST', body: JSON.stringify(payload) }),
  getEventParticipants: () => request<any[]>('/events/participants'),
  getAdminOverview: () => request<any>('/admin/overview'),
  getAdminImpact: () => request<any>('/admin/impact'),
  getAdminCompletions: () => request<any[]>('/admin/completions'),
  updateAdminCompletion: (id: string, status: string) => request(`/admin/completions/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createChallenge: (payload: unknown) => request('/admin/challenges', { method: 'POST', body: JSON.stringify(payload) }),
  updateChallenge: (id: string, payload: unknown) => request(`/admin/challenges/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteChallenge: (id: string) => request(`/admin/challenges/${id}`, { method: 'DELETE' }),
  createQuizQuestion: (payload: unknown) => request('/admin/quiz-questions', { method: 'POST', body: JSON.stringify(payload) }),
  deleteQuizQuestion: (id: string) => request(`/admin/quiz-questions/${id}`, { method: 'DELETE' }),
};
