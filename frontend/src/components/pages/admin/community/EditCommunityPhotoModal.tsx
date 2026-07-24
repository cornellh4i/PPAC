import { useEffect, useRef, useState } from 'react';
import { auth } from '../../../../firebase/config';
import { CommunityPhoto, uploadCommunityPhoto, updateCommunityPhoto } from './communityApi';
import './EditCommunityPhotoModal.scss';

interface Props {
  /** Pass an existing scrapbook photo to edit; omit to open in create mode. */
  photo?: CommunityPhoto;
  onClose: () => void;
  onSave: (photo: CommunityPhoto) => void;
}

const EditCommunityPhotoModal: React.FC<Props> = ({ photo, onClose, onSave }) => {
  const isCreate = !photo;
  const [caption, setCaption] = useState(photo?.caption ?? '');
  const [date, setDate] = useState(photo?.date ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(photo?.imageUrl);
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
    if (isCreate && !file) {
      setError('An image is required.');
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
      formData.append('caption', caption);
      formData.append('date', date);

      if (isCreate) {
        formData.append('section', 'scrapbook');
        const created = await uploadCommunityPhoto(token, formData);
        onSave(created);
      } else {
        const updated = await updateCommunityPhoto(token, photo!._id, formData);
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
      className="ecm-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="ecm" role="dialog" aria-modal="true">
        <div className="ecm__header">
          <span className="ecm__title">{isCreate ? 'Add scrapbook photo' : 'Edit scrapbook photo'}</span>
          <button className="ecm__close" type="button" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="ecm__body">
          <div className="ecm__field">
            <label className="ecm__label">Photo</label>
            {previewUrl ? (
              <img className="ecm__preview" src={previewUrl} alt="Preview" />
            ) : (
              <div className="ecm__preview ecm__preview--empty" aria-hidden="true" />
            )}
            <input
              className="ecm__file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="ecm__row ecm__row--2col">
            <div className="ecm__field">
              <label className="ecm__label">Caption</label>
              <input
                className="ecm__input"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Shared Joy"
              />
            </div>
            <div className="ecm__field">
              <label className="ecm__label">Date</label>
              <input
                className="ecm__input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="MARCH 2026"
              />
            </div>
          </div>

          {error && <p className="ecm__error">{error}</p>}
        </div>

        <div className="ecm__footer">
          <button className="ecm__btn ecm__btn--cancel" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="ecm__btn ecm__btn--save"
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : isCreate ? 'Add photo' : 'Save changes'}
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

export default EditCommunityPhotoModal;
