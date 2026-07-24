import { useEffect, useRef, useState } from "react";
import { auth } from "../../../../firebase/config";
import ProviderFormModal from "./ProviderFormModal";
import { Provider, getProviders, deleteProvider } from "./providersApi";
import { getAvatarIcon } from "./avatarOptions";
import "./index.scss";

const getToken = async (): Promise<string> => {
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not signed in");
  return currentUser.getIdToken();
};

const AdminProviders: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Provider | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Provider | null>(null);

  const loadProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getProviders();
      setProviders(list);
    } catch (err) {
      setError((err as Error).message || "Failed to load providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProviders();
  }, []);

  const handleCreate = (created: Provider) => {
    setProviders((prev) => [...prev, created]);
    setShowCreate(false);
  };

  const handleSaveEdit = (updated: Provider) => {
    setProviders((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = await getToken();
      await deleteProvider(token, deleteTarget._id);
      setProviders((prev) => prev.filter((p) => p._id !== deleteTarget._id));
    } catch (err) {
      setError((err as Error).message || "Failed to delete provider");
      return;
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="admin-providers">
        {error && <p className="admin-providers__error">{error}</p>}

        <div className="admin-providers__card">
          <div className="admin-providers__card-header">
            <span className="admin-providers__card-title">Providers</span>
            <button className="admin-providers__add-btn" type="button" onClick={() => setShowCreate(true)}>
              + Add provider
            </button>
          </div>

          {loading && <p className="admin-providers__status">Loading…</p>}
          {!loading && providers.length === 0 && (
            <p className="admin-providers__status">No providers yet.</p>
          )}

          {!loading && providers.length > 0 && (
            <div className="admin-providers__table-wrap">
              <table className="admin-providers__table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Field</th>
                    <th>Location</th>
                    <th>Phone</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr key={provider._id}>
                      <td>
                        {getAvatarIcon(provider.avatar) ? (
                          <img
                            className="admin-providers__thumb"
                            src={getAvatarIcon(provider.avatar)}
                            alt={provider.name}
                          />
                        ) : (
                          <div className="admin-providers__thumb admin-providers__thumb--empty" aria-hidden="true" />
                        )}
                      </td>
                      <td>{provider.name}</td>
                      <td>{provider.field}</td>
                      <td>{provider.location}</td>
                      <td>{provider.number}</td>
                      <td>
                        <div className="admin-providers__actions">
                          <button
                            className="admin-providers__action-btn"
                            type="button"
                            aria-label="Edit provider"
                            onClick={() => setEditTarget(provider)}
                          >
                            <PencilIcon />
                          </button>
                          <button
                            className="admin-providers__action-btn admin-providers__action-btn--danger"
                            type="button"
                            aria-label="Delete provider"
                            onClick={() => setDeleteTarget(provider)}
                          >
                            <TrashIcon />
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
      </div>

      {showCreate && (
        <ProviderFormModal onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}

      {editTarget && (
        <ProviderFormModal provider={editTarget} onClose={() => setEditTarget(null)} onSave={handleSaveEdit} />
      )}

      {deleteTarget && (
        <DeleteConfirmModal onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      )}
    </>
  );
};

const DeleteConfirmModal: React.FC<{
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ onCancel, onConfirm }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="delete-confirm-overlay"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onCancel();
      }}
    >
      <div className="delete-confirm" role="dialog" aria-modal="true">
        <p className="delete-confirm__heading">Delete provider?</p>
        <p className="delete-confirm__body">
          This provider will be permanently removed. This cannot be undone.
        </p>
        <div className="delete-confirm__footer">
          <button className="delete-confirm__btn delete-confirm__btn--cancel" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="delete-confirm__btn delete-confirm__btn--delete" type="button" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
    <path d="M10.5 2.5l2 2L5 12H3v-2l7.5-7.5z" stroke="#9ca3af" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);

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

export default AdminProviders;
