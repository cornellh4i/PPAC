import { useEffect, useRef, useState } from 'react';
import './EditResourceModal.scss';

export interface ResourceFull {
  _id: string;
  title: string;
  type: string;
  description: string;
  link: string;
  file?: string;
  tags: string[];
  status: 'published' | 'draft';
  readAt: { label: string; url: string }[];
  borrowAt: { label: string; url: string }[];
  createdAt?: string;
}

interface Props {
  resource: ResourceFull;
  onClose: () => void;
  onSave: (updated: ResourceFull) => void;
}

const TYPES = ['website', 'podcast', 'book', 'local resource', 'informational'] as const;
const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8000';

const EditResourceModal: React.FC<Props> = ({ resource, onClose, onSave }) => {
  const [form, setForm] = useState<ResourceFull>({ ...resource });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = <K extends keyof ResourceFull>(key: K, value: ResourceFull[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !form.tags.includes(trimmed)) {
      set('tags', [...form.tags, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) =>
    set('tags', form.tags.filter((t) => t !== tag));

  const setBookLink = (
    field: 'readAt' | 'borrowAt',
    index: number,
    key: 'label' | 'url',
    value: string
  ) => {
    const updated = form[field].map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    );
    set(field, updated);
  };

  const addBookLink = (field: 'readAt' | 'borrowAt') =>
    set(field, [...form[field], { label: '', url: '' }]);

  const removeBookLink = (field: 'readAt' | 'borrowAt', index: number) =>
    set(field, form[field].filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/resources/${form._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          description: form.description,
          link: form.link,
          file: form.file,
          tags: form.tags,
          status: form.status,
          readAt: form.readAt,
          borrowAt: form.borrowAt,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      onSave(form);
    } catch (err) {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className="erm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="erm" role="dialog" aria-modal="true" aria-label="Edit resource">
        <div className="erm__header">
          <span className="erm__title">Edit resource</span>
          <button className="erm__close" type="button" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="erm__body">
          <div className="erm__row erm__row--2col">
            <Field label="Title">
              <input
                className="erm__input"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </Field>

            <Field label="Type">
              <select
                className="erm__select"
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="erm__row erm__row--2col">
            <Field label="Status">
              <select
                className="erm__select"
                value={form.status}
                onChange={(e) => set('status', e.target.value as 'published' | 'draft')}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>

            <Field label="Link (URL)">
              <input
                className="erm__input"
                value={form.link}
                onChange={(e) => set('link', e.target.value)}
                placeholder="https://"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              className="erm__textarea"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
            />
          </Field>

          <Field label="File (optional URL)">
            <input
              className="erm__input"
              value={form.file ?? ''}
              onChange={(e) => set('file', e.target.value || undefined)}
              placeholder="https://"
            />
          </Field>

          <Field label="Tags">
            <div className="erm__tag-input-row">
              <input
                className="erm__input erm__input--flex"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
                }}
                placeholder="Type tag and press Enter"
              />
              <button className="erm__tag-add-btn" type="button" onClick={addTag}>Add</button>
            </div>
            {form.tags.length > 0 && (
              <div className="erm__chips">
                {form.tags.map((tag) => (
                  <span key={tag} className="erm__chip">
                    {tag}
                    <button
                      className="erm__chip-remove"
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          <BookLinkSection
            label="Read At"
            links={form.readAt}
            onChange={(i, k, v) => setBookLink('readAt', i, k, v)}
            onAdd={() => addBookLink('readAt')}
            onRemove={(i) => removeBookLink('readAt', i)}
          />

          <BookLinkSection
            label="Borrow At"
            links={form.borrowAt}
            onChange={(i, k, v) => setBookLink('borrowAt', i, k, v)}
            onAdd={() => addBookLink('borrowAt')}
            onRemove={(i) => removeBookLink('borrowAt', i)}
          />

          {error && <p className="erm__error">{error}</p>}
        </div>

        <div className="erm__footer">
          <button className="erm__btn erm__btn--cancel" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="erm__btn erm__btn--save"
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="erm__field">
    <label className="erm__label">{label}</label>
    {children}
  </div>
);

const BookLinkSection: React.FC<{
  label: string;
  links: { label: string; url: string }[];
  onChange: (index: number, key: 'label' | 'url', value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}> = ({ label, links, onChange, onAdd, onRemove }) => (
  <div className="erm__field">
    <div className="erm__label-row">
      <span className="erm__label">{label}</span>
      <button className="erm__link-add-btn" type="button" onClick={onAdd}>+ Add</button>
    </div>
    {links.map((link, i) => (
      <div key={i} className="erm__link-row">
        <input
          className="erm__input erm__input--flex"
          placeholder="Label"
          value={link.label}
          onChange={(e) => onChange(i, 'label', e.target.value)}
        />
        <input
          className="erm__input erm__input--flex"
          placeholder="URL"
          value={link.url}
          onChange={(e) => onChange(i, 'url', e.target.value)}
        />
        <button
          className="erm__link-remove-btn"
          type="button"
          onClick={() => onRemove(i)}
          aria-label="Remove"
        >
          <CloseIcon />
        </button>
      </div>
    ))}
  </div>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default EditResourceModal;
