import { useEffect, useMemo, useRef, useState } from 'react';
import { auth } from '../../../../firebase/config';
import EditResourceModal, { ResourceFull } from './EditResourceModal';
import './index.scss';

const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8000';

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  website:          { bg: '#fce4e8', color: '#b5294a' },
  podcast:          { bg: '#ede4fc', color: '#6b3ec0' },
  book:             { bg: '#e4eeff', color: '#3b5ec0' },
  'local resource': { bg: '#fef3e4', color: '#a0622e' },
  informational:    { bg: '#e4fce4', color: '#2a8c3c' },
};

const TAG_PALETTE = [
  { bg: '#fde8cd', color: '#8c5a22' },
  { bg: '#e9d5ff', color: '#6b21a8' },
  { bg: '#bfdbfe', color: '#1e40af' },
  { bg: '#d1fae5', color: '#065f46' },
];

const AdminResources: React.FC = () => {
  const [resources, setResources] = useState<ResourceFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editTarget, setEditTarget] = useState<ResourceFull | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ResourceFull | null>(null);
  const [adminMongoId, setAdminMongoId] = useState<string | undefined>();

  useEffect(() => {
    fetch(`${API_BASE}/api/resources`)
      .then((res) => res.json())
      .then((json) => {
        const raw: any[] = json.data ?? json;
        setResources(
          raw.map((r) => ({
            _id: r._id,
            title: r.title,
            type: r.type,
            description: r.description ?? '',
            link: r.link ?? '',
            file: r.file,
            tags: r.tags ?? [],
            status: r.status ?? 'published',
            readAt: r.readAt ?? [],
            borrowAt: r.borrowAt ?? [],
            createdAt: r.createdAt,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch the admin's MongoDB _id for use as createdBy when creating resources
    const firebaseAuth = auth;
    if (firebaseAuth?.currentUser) {
      firebaseAuth.currentUser.getIdToken().then((token) => {
        fetch(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((json) => { if (json.user?._id) setAdminMongoId(json.user._id); })
          .catch(console.error);
      });
    }
  }, []);

  const visible = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return resources.filter((r) => {
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [resources, searchQuery, statusFilter]);

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  const handleSaveEdit = (updated: ResourceFull) => {
    setResources((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    setEditTarget(null);
  };

  const handleCreate = (created: ResourceFull) => {
    setResources((prev) => [created, ...prev]);
    setShowCreate(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE}/api/resources/${deleteTarget._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setResources((prev) => prev.filter((r) => r._id !== deleteTarget._id));
    } catch {
      // keep modal open so user sees the failure
      return;
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="admin-resources">
        <div className="admin-resources__card">

          <div className="admin-resources__card-header">
            <span className="admin-resources__card-title">All resources</span>
            <button className="admin-resources__view-all" type="button">View all</button>
          </div>

          <div className="admin-resources__toolbar">
            <div className="admin-resources__search-wrap">
              <SearchIcon />
              <input
                className="admin-resources__search"
                type="search"
                placeholder="Search resources"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="admin-resources__select-wrap">
              <select
                className="admin-resources__select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <ChevronIcon />
            </div>

            <button
              className="admin-resources__add-btn"
              type="button"
              onClick={() => setShowCreate(true)}
            >
              + Add resource
            </button>
          </div>

          <div className="admin-resources__table-wrap">
            <table className="admin-resources__table">
              <thead>
                <tr className="admin-resources__thead-row">
                  <th className="admin-resources__th">Title</th>
                  <th className="admin-resources__th">Type</th>
                  <th className="admin-resources__th">Tags</th>
                  <th className="admin-resources__th">Status</th>
                  <th className="admin-resources__th">Published</th>
                  <th className="admin-resources__th" />
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="admin-resources__empty-cell">Loading…</td>
                  </tr>
                )}
                {!loading && visible.length === 0 && (
                  <tr>
                    <td colSpan={6} className="admin-resources__empty-cell">No resources found.</td>
                  </tr>
                )}
                {visible.map((r) => {
                  const typeStyle = TYPE_STYLE[r.type.toLowerCase()] ?? { bg: '#e8e8e8', color: '#444' };
                  return (
                    <tr key={r._id} className="admin-resources__row">
                      <td className="admin-resources__td admin-resources__td--title">{r.title}</td>
                      <td className="admin-resources__td">
                        <span
                          className="admin-resources__badge"
                          style={{ background: typeStyle.bg, color: typeStyle.color }}
                        >
                          {r.type}
                        </span>
                      </td>
                      <td className="admin-resources__td">
                        <div className="admin-resources__tags">
                          {r.tags.map((tag, i) => {
                            const p = TAG_PALETTE[i % TAG_PALETTE.length];
                            return (
                              <span key={tag} className="admin-resources__tag" style={{ background: p.bg, color: p.color }}>
                                {tag}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="admin-resources__td">
                        <span className="admin-resources__status">
                          <span
                            className="admin-resources__status-dot"
                            style={{ background: r.status === 'published' ? '#22c55e' : '#f59e0b' }}
                          />
                          {r.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="admin-resources__td admin-resources__td--date">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="admin-resources__td admin-resources__td--actions">
                        <button
                          className="admin-resources__action-btn"
                          type="button"
                          aria-label="Edit resource"
                          onClick={() => setEditTarget(r)}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          className="admin-resources__action-btn admin-resources__action-btn--danger"
                          type="button"
                          aria-label="Delete resource"
                          onClick={() => setDeleteTarget(r)}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {showCreate && (
        <EditResourceModal
          createdById={adminMongoId}
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}

      {editTarget && (
        <EditResourceModal
          resource={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveEdit}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.title}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
};

const DeleteConfirmModal: React.FC<{
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ title, onCancel, onConfirm }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="delete-confirm-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}
    >
      <div className="delete-confirm" role="dialog" aria-modal="true">
        <p className="delete-confirm__heading">Delete resource?</p>
        <p className="delete-confirm__body">
          <strong>"{title}"</strong> will be permanently removed. This cannot be undone.
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

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
    <circle cx="8" cy="8" r="5.5" stroke="#9ca3af" strokeWidth="1.5" />
    <path d="M12.5 12.5L16 16" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M3 5l4 4 4-4" stroke="#6b7280" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
    <path d="M10.5 2.5l2 2L5 12H3v-2l7.5-7.5z" stroke="#9ca3af" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
    <path d="M2 4h11M5 4V2.5h5V4M6 7v4M9 7v4M3 4l1 9h7l1-9" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default AdminResources;
