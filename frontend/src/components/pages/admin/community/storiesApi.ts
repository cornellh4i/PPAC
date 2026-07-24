const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export type StoryStatus = 'pending' | 'published';

export interface Story {
  _id: string;
  story: string;
  name?: string | null;
  isAnonymous: boolean;
  status: StoryStatus;
  createdAt?: string;
  updatedAt?: string;
}

export const getAdminStories = async (token: string): Promise<Story[]> => {
  const response = await fetch(`${API_URL}/api/stories/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to fetch stories');
  return json.data ?? [];
};

export const createStory = async (
  token: string,
  payload: { story: string; name?: string; isAnonymous: boolean; status: StoryStatus },
): Promise<Story> => {
  const response = await fetch(`${API_URL}/api/stories/admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to create story');
  return json.data;
};

export const updateStoryStatus = async (
  token: string,
  id: string,
  status: StoryStatus,
): Promise<Story> => {
  const response = await fetch(`${API_URL}/api/stories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to update story status');
  return json.data;
};

export const deleteStory = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/stories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.error || 'Failed to delete story');
  }
};
