import { useEffect, useRef, useState } from "react";
import { auth } from "../../../../firebase/config";
import {
  AdminEvent,
  EventFormValues,
  EventType,
  LocationType,
  Visibility,
  createEvent,
  updateEvent,
} from "./eventsApi";
import "./EventFormModal.scss";

interface Props {
  /** Pass an existing event to edit; omit to open in create mode. */
  event?: AdminEvent;
  onClose: () => void;
  onSave: (event: AdminEvent) => void;
}

/** "2026-03-05T15:00" <-> ISO string, for <input type="datetime-local"> */
const toDatetimeLocal = (iso?: string): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const fromDatetimeLocal = (local: string): string =>
  local ? new Date(local).toISOString() : "";

const EventFormModal: React.FC<Props> = ({ event, onClose, onSave }) => {
  const isCreate = !event;
  const overlayRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [eventType, setEventType] = useState<EventType>(
    event?.eventType ?? "ppac",
  );
  const [startTime, setStartTime] = useState(
    toDatetimeLocal(event?.startTime),
  );
  const [endTime, setEndTime] = useState(toDatetimeLocal(event?.endTime));
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [locationType, setLocationType] = useState<LocationType>(
    event?.location.type ?? "in_person",
  );
  const [venue, setVenue] = useState(event?.location.venue ?? "");
  const [address, setAddress] = useState(event?.location.address ?? "");
  const [link, setLink] = useState(event?.location.link ?? "");
  const [organizerName, setOrganizerName] = useState(
    event?.organizer.name ?? "",
  );
  const [organizerOrg, setOrganizerOrg] = useState(
    event?.organizer.organization ?? "",
  );
  const [organizerEmail, setOrganizerEmail] = useState(
    event?.organizer.contactEmail ?? "",
  );
  const [tags, setTags] = useState((event?.tags ?? []).join(", "));
  const [isPublished, setIsPublished] = useState(event?.isPublished ?? false);
  const [visibility, setVisibility] = useState<Visibility>(
    event?.visibility ?? "public",
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!startTime || !endTime) {
      setError("Start and end time are required.");
      return;
    }
    if (!venue.trim()) {
      setError("Venue is required.");
      return;
    }
    if (!organizerName.trim() || !organizerOrg.trim() || !organizerEmail.trim()) {
      setError("Organizer name, organization, and contact email are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload: EventFormValues = {
      title: title.trim(),
      description: description.trim(),
      eventType,
      startTime: fromDatetimeLocal(startTime),
      endTime: fromDatetimeLocal(endTime),
      allDay,
      location: {
        type: locationType,
        venue: venue.trim(),
        address: address.trim() || null,
        link: link.trim() || null,
      },
      organizer: {
        name: organizerName.trim(),
        organization: organizerOrg.trim(),
        contactEmail: organizerEmail.trim(),
      },
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      isPublished,
      visibility,
    };

    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) throw new Error("Not signed in");
      const token = await currentUser.getIdToken();

      const saved = isCreate
        ? await createEvent(token, payload)
        : await updateEvent(token, event!._id, payload);
      onSave(saved);
    } catch (err) {
      setError((err as Error).message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="efm-overlay"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="efm" role="dialog" aria-modal="true">
        <div className="efm__header">
          <span className="efm__title">
            {isCreate ? "Add event" : "Edit event"}
          </span>
          <button
            className="efm__close"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="efm__body">
          <div className="efm__field">
            <label className="efm__label">Title</label>
            <input
              className="efm__input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="3/20 Speaker Panel"
            />
          </div>

          <div className="efm__field">
            <label className="efm__label">Description</label>
            <textarea
              className="efm__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="efm__row efm__row--2col">
            <div className="efm__field">
              <label className="efm__label">Event type</label>
              <select
                className="efm__input"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as EventType)}
              >
                <option value="ppac">PPAC</option>
                <option value="partner">Partner</option>
                <option value="campus">Campus</option>
              </select>
            </div>
            <div className="efm__field">
              <label className="efm__label">Visibility</label>
              <select
                className="efm__input"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as Visibility)}
              >
                <option value="public">Public</option>
                <option value="ppac_only">PPAC only</option>
              </select>
            </div>
          </div>

          <div className="efm__row efm__row--2col">
            <div className="efm__field">
              <label className="efm__label">Start time</label>
              <input
                className="efm__input"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="efm__field">
              <label className="efm__label">End time</label>
              <input
                className="efm__input"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <label className="efm__checkbox">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
            />
            All-day event
          </label>

          <div className="efm__field">
            <label className="efm__label">Location type</label>
            <select
              className="efm__input"
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as LocationType)}
            >
              <option value="in_person">In person</option>
              <option value="virtual">Virtual</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="efm__row efm__row--2col">
            <div className="efm__field">
              <label className="efm__label">Venue</label>
              <input
                className="efm__input"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Phillips Hall 200"
              />
            </div>
            <div className="efm__field">
              <label className="efm__label">Address (optional)</label>
              <input
                className="efm__input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="efm__field">
            <label className="efm__label">Link (optional)</label>
            <input
              className="efm__input"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://zoom.us/..."
            />
          </div>

          <div className="efm__row efm__row--2col">
            <div className="efm__field">
              <label className="efm__label">Organizer name</label>
              <input
                className="efm__input"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
              />
            </div>
            <div className="efm__field">
              <label className="efm__label">Organizer organization</label>
              <input
                className="efm__input"
                value={organizerOrg}
                onChange={(e) => setOrganizerOrg(e.target.value)}
              />
            </div>
          </div>

          <div className="efm__field">
            <label className="efm__label">Organizer contact email</label>
            <input
              className="efm__input"
              type="email"
              value={organizerEmail}
              onChange={(e) => setOrganizerEmail(e.target.value)}
            />
          </div>

          <div className="efm__field">
            <label className="efm__label">Tags (comma-separated)</label>
            <input
              className="efm__input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="workshop, mental health"
            />
          </div>

          <label className="efm__checkbox">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Published (visible on the public events page)
          </label>

          {error && <p className="efm__error">{error}</p>}
        </div>

        <div className="efm__footer">
          <button
            className="efm__btn efm__btn--cancel"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="efm__btn efm__btn--save"
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? "Saving…" : isCreate ? "Add event" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M2 2l10 10M12 2L2 12"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export default EventFormModal;
