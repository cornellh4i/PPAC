const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export interface PresidentsLetter {
  _id: string;
  paragraphs: string[];
  closing?: string;
  signature?: string;
  updatedAt?: string;
}

export const getPresidentsLetter = async (): Promise<PresidentsLetter | null> => {
  const response = await fetch(`${API_URL}/api/presidents-letter`);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Failed to fetch presidents letter");
  return json.data ?? null;
};

export const updatePresidentsLetter = async (
  token: string,
  payload: { paragraphs?: string[]; closing?: string; signature?: string },
): Promise<PresidentsLetter> => {
  const response = await fetch(`${API_URL}/api/presidents-letter`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Failed to update presidents letter");
  return json.data;
};
