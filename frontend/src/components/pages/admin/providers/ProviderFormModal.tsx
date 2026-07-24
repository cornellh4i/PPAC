import { useEffect, useRef, useState } from 'react';
import { auth } from '../../../../firebase/config';
import { Availability, Provider, createProvider, updateProvider } from './providersApi';
import { AVATAR_OPTIONS, Avatar } from './avatarOptions';
import './ProviderFormModal.scss';

const PROVIDER_FIELDS = [
  'Reproductive Health',
  'Counseling & Psychology',
  'General Medicine',
];

interface Props {
  /** Pass an existing provider to edit; omit to open in create mode. */
  provider?: Provider;
  onClose: () => void;
  onSave: (provider: Provider) => void;
}

const ProviderFormModal: React.FC<Props> = ({ provider, onClose, onSave }) => {
  const isCreate = !provider;
  const [name, setName] = useState(provider?.name ?? '');
  const [field, setField] = useState(provider?.field ?? PROVIDER_FIELDS[0]);
  const [location, setLocation] = useState(provider?.location ?? '');
  const [rating, setRating] = useState(provider?.rating?.toString() ?? '');
  const [number, setNumber] = useState(provider?.number ?? '');
  const [about, setAbout] = useState(provider?.about ?? '');
  const [experience, setExperience] = useState(provider?.experience ?? '');
  const [availability, setAvailability] = useState<Availability[]>(
    provider?.availability?.length ? provider.availability : [{ day: '', time: '' }]
  );
  const [insurance, setInsurance] = useState(provider?.insurance?.join(', ') ?? '');
  const [bookingLink, setBookingLink] = useState(provider?.bookingLink ?? '');
  const [avatar, setAvatar] = useState<Avatar | undefined>(provider?.avatar);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const updateSlot = (index: number, field: keyof Availability, value: string) => {
    setAvailability((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    );
  };

  const addSlot = () => setAvailability((prev) => [...prev, { day: '', time: '' }]);
  const removeSlot = (index: number) =>
    setAvailability((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (
      !name.trim() ||
      !field.trim() ||
      !location.trim() ||
      !number.trim() ||
      !about.trim() ||
      !experience.trim() ||
      !bookingLink.trim()
    ) {
      setError('Name, field, location, phone, about, experience, and booking link are required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) throw new Error('Not signed in');
      const token = await currentUser.getIdToken();

      const cleanedAvailability = availability.filter((slot) => slot.day.trim() && slot.time.trim());
      const cleanedInsurance = insurance
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        name: name.trim(),
        field: field.trim(),
        location: location.trim(),
        number: number.trim(),
        about: about.trim(),
        experience: experience.trim(),
        rating: rating.trim() ? Number(rating.trim()) : undefined,
        availability: cleanedAvailability,
        insurance: cleanedInsurance,
        avatar,
        bookingLink: bookingLink.trim(),
      };

      if (isCreate) {
        const created = await createProvider(token, payload);
        onSave(created);
      } else {
        const updated = await updateProvider(token, provider!._id, payload);
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
      className="pfm-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="pfm" role="dialog" aria-modal="true">
        <div className="pfm__header">
          <span className="pfm__title">{isCreate ? 'Add provider' : 'Edit provider'}</span>
          <button className="pfm__close" type="button" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="pfm__body">
          <div className="pfm__field">
            <label className="pfm__label">Avatar</label>
            <div className="pfm__avatarOptions">
              {AVATAR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`pfm__avatarOption${avatar === option.value ? ' pfm__avatarOption--selected' : ''}`}
                  onClick={() => setAvatar(option.value)}
                  aria-pressed={avatar === option.value}
                >
                  <img src={option.icon} alt={option.label} className="pfm__avatarOptionImg" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pfm__row pfm__row--2col">
            <div className="pfm__field">
              <label className="pfm__label">Name</label>
              <input className="pfm__input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Sarah Chen" />
            </div>
            <div className="pfm__field">
              <label className="pfm__label">Field</label>
              <select className="pfm__input" value={field} onChange={(e) => setField(e.target.value)}>
                {PROVIDER_FIELDS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pfm__row pfm__row--2col">
            <div className="pfm__field">
              <label className="pfm__label">Location</label>
              <input className="pfm__input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="110 Ho Plaza, Ithaca, NY" />
            </div>
            <div className="pfm__field">
              <label className="pfm__label">Phone number</label>
              <input className="pfm__input" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="(607) 255-5155" />
            </div>
          </div>

          <div className="pfm__row pfm__row--2col">
            <div className="pfm__field">
              <label className="pfm__label">Rating (optional)</label>
              <input
                className="pfm__input"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="4.8"
              />
            </div>
            <div className="pfm__field">
              <label className="pfm__label">Insurance (comma separated)</label>
              <input
                className="pfm__input"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                placeholder="Cornell SHP, Aetna, Self-pay"
              />
            </div>
          </div>

          <div className="pfm__field">
            <label className="pfm__label">Booking link</label>
            <input
              className="pfm__input"
              value={bookingLink}
              onChange={(e) => setBookingLink(e.target.value)}
              placeholder="https://calendly.com/..."
            />
          </div>

          <div className="pfm__field">
            <label className="pfm__label">Availability</label>
            {availability.map((slot, i) => (
              <div className="pfm__row pfm__slotRow" key={i}>
                <input
                  className="pfm__input"
                  value={slot.day}
                  onChange={(e) => updateSlot(i, 'day', e.target.value)}
                  placeholder="Mon–Sat"
                />
                <input
                  className="pfm__input"
                  value={slot.time}
                  onChange={(e) => updateSlot(i, 'time', e.target.value)}
                  placeholder="8 AM – 8 PM"
                />
                <button
                  className="pfm__slotRemove"
                  type="button"
                  onClick={() => removeSlot(i)}
                  aria-label="Remove availability slot"
                  disabled={availability.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
            <button className="pfm__slotAdd" type="button" onClick={addSlot}>
              + Add time slot
            </button>
          </div>

          <div className="pfm__field">
            <label className="pfm__label">About</label>
            <textarea
              className="pfm__textarea"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={3}
            />
          </div>

          <div className="pfm__field">
            <label className="pfm__label">Experience</label>
            <textarea
              className="pfm__textarea"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={3}
            />
          </div>

          {error && <p className="pfm__error">{error}</p>}
        </div>

        <div className="pfm__footer">
          <button className="pfm__btn pfm__btn--cancel" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="pfm__btn pfm__btn--save" type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isCreate ? 'Add provider' : 'Save changes'}
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

export default ProviderFormModal;
