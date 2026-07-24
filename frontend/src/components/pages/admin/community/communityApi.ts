const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface CommunityPhoto {
  _id: string;
  section: 'hero' | 'scrapbook';
  imageUrl: string;
  caption?: string;
  date?: string;
  order?: number;
  createdAt?: string;
}

export const getCommunityPhotos = async (section?: 'hero' | 'scrapbook'): Promise<CommunityPhoto[]> => {
  const query = section ? `?section=${section}` : '';
  const response = await fetch(`${API_URL}/api/community${query}`);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to fetch community photos');
  return json.data ?? [];
};

export const uploadCommunityPhoto = async (token: string, formData: FormData): Promise<CommunityPhoto> => {
  const response = await fetch(`${API_URL}/api/community`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to upload community photo');
  return json.data;
};

export const updateCommunityPhoto = async (
  token: string,
  id: string,
  formData: FormData
): Promise<CommunityPhoto> => {
  const response = await fetch(`${API_URL}/api/community/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to update community photo');
  return json.data;
};

export const deleteCommunityPhoto = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/community/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.error || 'Failed to delete community photo');
  }
};
