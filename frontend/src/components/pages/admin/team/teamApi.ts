const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  category: 'officer' | 'speaker';
  imageUrl?: string;
  linkedinUrl?: string;
  order?: number;
  createdAt?: string;
}

export const getTeamMembers = async (category?: 'officer' | 'speaker'): Promise<TeamMember[]> => {
  const query = category ? `?category=${category}` : '';
  const response = await fetch(`${API_URL}/api/team-members${query}`);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to fetch team members');
  return json.data ?? [];
};

export const createTeamMember = async (token: string, formData: FormData): Promise<TeamMember> => {
  const response = await fetch(`${API_URL}/api/team-members`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to create team member');
  return json.data;
};

export const updateTeamMember = async (
  token: string,
  id: string,
  formData: FormData
): Promise<TeamMember> => {
  const response = await fetch(`${API_URL}/api/team-members/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Failed to update team member');
  return json.data;
};

export const deleteTeamMember = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/team-members/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.error || 'Failed to delete team member');
  }
};
