import React, { useEffect, useState } from 'react';
import { auth } from '../../../../firebase/config';
import {
  addAllowedAdminEmail,
  getAllowedAdminEmails,
  removeAllowedAdminEmail,
} from '../adminAccess';
import './index.scss';

const AdminSettings: React.FC = () => {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getToken = async (): Promise<string | null> => {
    const currentUser = auth?.currentUser;
    if (!currentUser) return null;
    return currentUser.getIdToken();
  };

  const loadEmails = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');
      const list = await getAllowedAdminEmails(token);
      setEmails(list);
    } catch (err) {
      setError((err as Error).message || 'Failed to load admin emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEmails();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');
      const list = await addAllowedAdminEmail(token, trimmed);
      setEmails(list);
      setNewEmail('');
    } catch (err) {
      setError((err as Error).message || 'Failed to add admin email');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (email: string) => {
    setError('');
    try {
      const token = await getToken();
      if (!token) throw new Error('Not signed in');
      const list = await removeAllowedAdminEmail(token, email);
      setEmails(list);
    } catch (err) {
      setError((err as Error).message || 'Failed to remove admin email');
    }
  };

  return (
    <div className="admin-settings">
      <div className="admin-settings__card">
        <div className="admin-settings__card-header">
          <span className="admin-settings__card-title">Admin access</span>
        </div>

        <form className="admin-settings__toolbar" onSubmit={handleAdd}>
          <input
            className="admin-settings__input"
            type="email"
            placeholder="Add admin email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
          <button className="admin-settings__add-btn" type="submit" disabled={submitting}>
            + Add admin
          </button>
        </form>

        {error && <p className="admin-settings__error">{error}</p>}

        <ul className="admin-settings__list">
          {loading && <li className="admin-settings__empty">Loading…</li>}
          {!loading && emails.length === 0 && (
            <li className="admin-settings__empty">No admin emails found.</li>
          )}
          {!loading &&
            emails.map((email) => (
              <li key={email} className="admin-settings__row">
                <span className="admin-settings__email">{email}</span>
                <button
                  className="admin-settings__action-btn"
                  type="button"
                  aria-label={`Remove ${email}`}
                  onClick={() => handleDelete(email)}
                  disabled={emails.length <= 1}
                  title={emails.length <= 1 ? 'At least one admin email is required' : undefined}
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
    <path
      d="M2 4h11M5 4V2.5h5V4M6 7v4M9 7v4M3 4l1 9h7l1-9"
      stroke="#9ca3af"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default AdminSettings;
