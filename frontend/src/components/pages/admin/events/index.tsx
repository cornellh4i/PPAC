import { useEffect, useState } from "react";
import { auth } from "../../../../firebase/config";
import EventFormModal from "./EventFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import {
  AdminEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} from "./eventsApi";
import "./index.scss";

const getToken = async (): Promise<string> => {
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not signed in");
  return currentUser.getIdToken();
};

const EVENT_TYPE_LABELS: Record<AdminEvent["eventType"], string> = {
  ppac: "PPAC",
  partner: "Partner",
  campus: "Campus",
};

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getEvents();
      const sorted = [...list].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
      setEvents(sorted);
    } catch (err) {
      setError((err as Error).message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const handleCreated = (event: AdminEvent) => {
    setEvents((current) =>
      [...current, event].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    );
    setShowAdd(false);
  };

  const handleUpdated = (event: AdminEvent) => {
    setEvents((current) =>
      current
        .map((e) => (e._id === event._id ? event : e))
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        ),
    );
    setEditTarget(null);
  };

  const handleTogglePublished = async (event: AdminEvent) => {
    setError(null);
    const previous = events;
    setEvents((current) =>
      current.map((e) =>
        e._id === event._id ? { ...e, isPublished: !e.isPublished } : e,
      ),
    );
    try {
      const token = await getToken();
      await updateEvent(token, event._id, { isPublished: !event.isPublished });
    } catch (err) {
      setEvents(previous);
      setError((err as Error).message || "Failed to update event");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setError(null);
    const previous = events;
    setEvents((current) => current.filter((e) => e._id !== target._id));
    try {
      const token = await getToken();
      await deleteEvent(token, target._id);
    } catch (err) {
      setEvents(previous);
      setError((err as Error).message || "Failed to delete event");
    }
  };

  return (
    <div className="admin-events">
      {error && <p className="admin-events__error">{error}</p>}

      <div className="admin-events__card">
        <div className="admin-events__card-header">
          <span className="admin-events__card-title">Events</span>
          <button
            className="admin-events__add-btn"
            type="button"
            onClick={() => setShowAdd(true)}
          >
            + Add event
          </button>
        </div>

        {loading ? (
          <p className="admin-events__status">Loading…</p>
        ) : events.length === 0 ? (
          <p className="admin-events__status">
            No events yet. Add one to get started.
          </p>
        ) : (
          <div className="admin-events__table-wrap">
            <table className="admin-events__table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Start</th>
                  <th>Type</th>
                  <th>Visibility</th>
                  <th>Published</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event._id}>
                    <td>
                      <p className="admin-events__title-cell">{event.title}</p>
                      <p className="admin-events__venue-cell">
                        {event.location.venue}
                      </p>
                    </td>
                    <td>{formatDateTime(event.startTime)}</td>
                    <td>{EVENT_TYPE_LABELS[event.eventType]}</td>
                    <td>
                      {event.visibility === "public" ? "Public" : "PPAC only"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`admin-events__status-pill admin-events__status-pill--${
                          event.isPublished ? "published" : "draft"
                        }`}
                        onClick={() => void handleTogglePublished(event)}
                      >
                        {event.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td>
                      <div className="admin-events__row-actions">
                        <button
                          className="admin-events__action-btn"
                          type="button"
                          onClick={() => setEditTarget(event)}
                          aria-label={`Edit ${event.title}`}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-events__action-btn admin-events__action-btn--danger"
                          type="button"
                          onClick={() => setDeleteTarget(event)}
                          aria-label={`Delete ${event.title}`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <EventFormModal
          onClose={() => setShowAdd(false)}
          onSave={handleCreated}
        />
      )}

      {editTarget && (
        <EventFormModal
          event={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleUpdated}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          heading="Delete event?"
          body={`"${deleteTarget.title}" will be permanently removed. This cannot be undone.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => void handleConfirmDelete()}
        />
      )}
    </div>
  );
};

export default AdminEvents;
