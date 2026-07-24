const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface Availability {
  day: string;
  time: string;
}

export interface Provider {
  _id: string;
  name: string;
  field: string;
  location: string;
  rating?: number;
  availability: Availability[];
  insurance: string[];
  number: string;
  about: string;
  experience: string;
  avatar?: 'female' | 'male';
  bookingLink: string;
  order?: number;
  createdAt?: string;
}

export interface ProviderPayload {
  name: string;
  field: string;
  location: string;
  rating?: number;
  availability: Availability[];
  insurance: string[];
  number: string;
  about: string;
  experience: string;
  avatar?: 'female' | 'male';
  bookingLink: string;
}

export const getProviders = async (): Promise<Provider[]> => {
  const response = await fetch(`${API_URL}/api/providers`);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to fetch providers');
  return json.data ?? [];
};

export const createProvider = async (token: string, payload: ProviderPayload): Promise<Provider> => {
  const response = await fetch(`${API_URL}/api/providers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to create provider');
  return json.data;
};

export const updateProvider = async (
  token: string,
  id: string,
  payload: Partial<ProviderPayload>
): Promise<Provider> => {
  const response = await fetch(`${API_URL}/api/providers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to update provider');
  return json.data;
};

export const deleteProvider = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/providers/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.error || 'Failed to delete provider');
  }
};
