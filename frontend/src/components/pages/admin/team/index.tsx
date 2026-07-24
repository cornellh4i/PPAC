import { useEffect, useRef, useState } from "react";
import { auth } from "../../../../firebase/config";
import TeamMemberFormModal from "./TeamMemberFormModal";
import { TeamMember, getTeamMembers, deleteTeamMember } from "./teamApi";
import "./index.scss";

const getToken = async (): Promise<string> => {
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not signed in");
  return currentUser.getIdToken();
};

const AdminTeam: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
  const [createCategory, setCreateCategory] = useState<"officer" | "speaker" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getTeamMembers();
      setMembers(list);
    } catch (err) {
      setError((err as Error).message || "Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMembers();
  }, []);

  const handleCreate = (created: TeamMember) => {
    setMembers((prev) => [...prev, created]);
    setCreateCategory(null);
  };

  const handleSaveEdit = (updated: TeamMember) => {
    setMembers((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = await getToken();
      await deleteTeamMember(token, deleteTarget._id);
      setMembers((prev) => prev.filter((m) => m._id !== deleteTarget._id));
    } catch (err) {
      setError((err as Error).message || "Failed to delete team member");
      return;
    }
    setDeleteTarget(null);
  };

  const renderSection = (category: "officer" | "speaker", title: string) => {
    const list = members.filter((m) => m.category === category);
    return (
      <div className="admin-team__card">
        <div className="admin-team__card-header">
          <span className="admin-team__card-title">{title}</span>
          <button
            className="admin-team__add-btn"
            type="button"
            onClick={() => setCreateCategory(category)}
          >
            + Add member
          </button>
        </div>

        {!loading && list.length === 0 && (
          <p className="admin-team__status">No {title.toLowerCase()} yet.</p>
        )}

        {list.length > 0 && (
          <div className="admin-team__grid">
            {list.map((member) => (
              <div key={member._id} className="admin-team__grid-item">
                {member.imageUrl ? (
                  <img className="admin-team__photo" src={member.imageUrl} alt={member.name} />
                ) : (
                  <div className="admin-team__photo admin-team__photo--empty" aria-hidden="true" />
                )}
                <span className="admin-team__name">{member.name}</span>
                <span className="admin-team__role">{member.role}</span>
                <div className="admin-team__grid-item-actions">
                  <button
                    className="admin-team__action-btn"
                    type="button"
                    aria-label="Edit member"
                    onClick={() => setEditTarget(member)}
                  >
                    <PencilIcon />
                  </button>
                  <button
                    className="admin-team__action-btn admin-team__action-btn--danger"
                    type="button"
                    aria-label="Delete member"
                    onClick={() => setDeleteTarget(member)}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="admin-team">
        {error && <p className="admin-team__error">{error}</p>}
        {loading && <p className="admin-team__status">Loading…</p>}

        {!loading && (
          <>
            {renderSection("officer", "Officers")}
            {renderSection("speaker", "Speakers")}
          </>
        )}
      </div>

      {createCategory && (
        <TeamMemberFormModal
          defaultCategory={createCategory}
          onClose={() => setCreateCategory(null)}
          onSave={handleCreate}
        />
      )}

      {editTarget && (
        <TeamMemberFormModal
          member={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleSaveEdit}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
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
        <p className="delete-confirm__heading">Delete team member?</p>
        <p className="delete-confirm__body">
          This team member will be permanently removed. This cannot be undone.
        </p>
        <div className="delete-confirm__footer">
          <button
            className="delete-confirm__btn delete-confirm__btn--cancel"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="delete-confirm__btn delete-confirm__btn--delete"
            type="button"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const PencilIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
    <path
      d="M10.5 2.5l2 2L5 12H3v-2l7.5-7.5z"
      stroke="#9ca3af"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
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

export default AdminTeam;
