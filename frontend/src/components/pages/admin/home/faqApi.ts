const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const getFaqItems = async (): Promise<FaqItem[]> => {
  const response = await fetch(`${API_URL}/api/faq`);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Failed to fetch FAQ items");
  return json.data ?? [];
};

export const createFaqItem = async (
  token: string,
  payload: { question: string; answer: string; order?: number },
): Promise<FaqItem> => {
  const response = await fetch(`${API_URL}/api/faq`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Failed to create FAQ item");
  return json.data;
};

export const updateFaqItem = async (
  token: string,
  id: string,
  payload: { question?: string; answer?: string; order?: number },
): Promise<FaqItem> => {
  const response = await fetch(`${API_URL}/api/faq/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Failed to update FAQ item");
  return json.data;
};

export const deleteFaqItem = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/faq/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.error || "Failed to delete FAQ item");
  }
};
