const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export interface Testimonial {
  _id: string;
  quote: string;
  author: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const getTestimonials = async (): Promise<Testimonial[]> => {
  const response = await fetch(`${API_URL}/api/testimonials`);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Failed to fetch testimonials");
  return json.data ?? [];
};

export const createTestimonial = async (
  token: string,
  payload: { quote: string; author: string; order?: number },
): Promise<Testimonial> => {
  const response = await fetch(`${API_URL}/api/testimonials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Failed to create testimonial");
  return json.data;
};

export const updateTestimonial = async (
  token: string,
  id: string,
  payload: { quote?: string; author?: string; order?: number },
): Promise<Testimonial> => {
  const response = await fetch(`${API_URL}/api/testimonials/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Failed to update testimonial");
  return json.data;
};

export const deleteTestimonial = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/testimonials/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.error || "Failed to delete testimonial");
  }
};
