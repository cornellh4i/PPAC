import { useEffect, useRef, useState } from 'react';
import { auth } from '../../../../firebase/config';
import { TeamMember, createTeamMember, updateTeamMember } from './teamApi';
import './TeamMemberFormModal.scss';

interface Props {
  /** Pass an existing team member to edit; omit to open in create mode. */
  member?: TeamMember;
  /** Category to default to when creating. */
  defaultCategory?: 'officer' | 'speaker';
  onClose: () => void;
  onSave: (member: TeamMember) => void;
}

const TeamMemberFormModal: React.FC<Props> = ({ member, defaultCategory, onClose, onSave }) => {
  const isCreate = !member;
  const [name, setName] = useState(member?.name ?? '');
  const [role, setRole] = useState(member?.role ?? '');
  const [category, setCategory] = useState<'officer' | 'speaker'>(
    member?.category ?? defaultCategory ?? 'officer'
  );
  const [linkedinUrl, setLinkedinUrl] = useState(member?.linkedinUrl ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(member?.imageUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!role.trim()) {
      setError('Role is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) throw new Error('Not signed in');
      const token = await currentUser.getIdToken();

      const formData = new FormData();
      if (file) formData.append('image', file);
      formData.append('name', name.trim());
      formData.append('role', role.trim());
      formData.append('category', category);
      formData.append('linkedinUrl', linkedinUrl.trim());

      if (isCreate) {
        const created = await createTeamMember(token, formData);
        onSave(created);
      } else {
        const updated = await updateTeamMember(token, member!._id, formData);
        onSave(updated);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="tmm-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="tmm" role="dialog" aria-modal="true">
        <div className="tmm__header">
          <span className="tmm__title">{isCreate ? 'Add team member' : 'Edit team member'}</span>
          <button className="tmm__close" type="button" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="tmm__body">
          <div className="tmm__field">
            <label className="tmm__label">Photo</label>
            {previewUrl ? (
              <img className="tmm__preview" src={previewUrl} alt="Preview" />
            ) : (
              <div className="tmm__preview tmm__preview--empty" aria-hidden="true" />
            )}
            <input
              className="tmm__file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="tmm__row tmm__row--2col">
            <div className="tmm__field">
              <label className="tmm__label">Name</label>
              <input
                className="tmm__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div className="tmm__field">
              <label className="tmm__label">Role</label>
              <input
                className="tmm__input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="President"
              />
            </div>
          </div>

          <div className="tmm__row tmm__row--2col">
            <div className="tmm__field">
              <label className="tmm__label">Category</label>
              <select
                className="tmm__input"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'officer' | 'speaker')}
              >
                <option value="officer">Officer</option>
                <option value="speaker">Speaker</option>
              </select>
            </div>
            <div className="tmm__field">
              <label className="tmm__label">LinkedIn URL</label>
              <input
                className="tmm__input"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/..."
              />
            </div>
          </div>

          {error && <p className="tmm__error">{error}</p>}
        </div>

        <div className="tmm__footer">
          <button className="tmm__btn tmm__btn--cancel" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="tmm__btn tmm__btn--save"
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : isCreate ? 'Add member' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default TeamMemberFormModal;
