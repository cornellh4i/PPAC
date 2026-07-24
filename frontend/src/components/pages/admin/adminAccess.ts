const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// Checks whether the currently signed-in user (identified by their Firebase ID token)
// is allowed to access the admin dashboard.
export const isAllowedAdminEmail = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/admin-emails/check`, {
      headers: authHeaders(token),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return Boolean(data.isAdmin);
  } catch (error) {
    console.error('Failed to check admin access:', error);
    return false;
  }
};

// Returns the full list of allowed admin emails. Caller must already be an admin.
export const getAllowedAdminEmails = async (token: string): Promise<string[]> => {
  const response = await fetch(`${API_URL}/api/auth/admin-emails`, {
    headers: authHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to fetch admin emails');
  const data = await response.json();
  return data.emails ?? [];
};

export const addAllowedAdminEmail = async (token: string, email: string): Promise<string[]> => {
  const response = await fetch(`${API_URL}/api/auth/admin-emails`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to add admin email');
  return data.emails ?? [];
};

export const removeAllowedAdminEmail = async (token: string, email: string): Promise<string[]> => {
  const response = await fetch(`${API_URL}/api/auth/admin-emails/${encodeURIComponent(email)}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to remove admin email');
  return data.emails ?? [];
};
