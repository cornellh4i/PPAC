import { useEffect, useRef, useState } from "react";
import { auth } from "../../../../firebase/config";
import PolaroidCard from "../../../molecules/PolaroidCard/PolaroidCard";
import EditCommunityPhotoModal from "./EditCommunityPhotoModal";
import AddStoryModal from "./AddStoryModal";
import {
  CommunityPhoto,
  getCommunityPhotos,
  uploadCommunityPhoto,
  updateCommunityPhoto,
  deleteCommunityPhoto,
} from "./communityApi";
import {
  Story,
  StoryStatus,
  getAdminStories,
  createStory,
  updateStoryStatus,
  deleteStory,
} from "./storiesApi";
import "./index.scss";

const getToken = async (): Promise<string> => {
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not signed in");
  return currentUser.getIdToken();
};

const MAX_SCRAPBOOK_PHOTOS = 4;

const formatDate = (value?: string): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const AdminCommunity: React.FC = () => {
  const [heroPhoto, setHeroPhoto] = useState<CommunityPhoto | null>(null);
  const [scrapbookPhotos, setScrapbookPhotos] = useState<CommunityPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const [editTarget, setEditTarget] = useState<CommunityPhoto | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CommunityPhoto | null>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const [stories, setStories] = useState<Story[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [storiesError, setStoriesError] = useState<string | null>(null);
  const [showAddStory, setShowAddStory] = useState(false);
  const [deleteStoryTarget, setDeleteStoryTarget] = useState<Story | null>(null);
  const [viewStoryTarget, setViewStoryTarget] = useState<Story | null>(null);

  const loadStories = async () => {
    setStoriesLoading(true);
    setStoriesError(null);
    try {
      const token = await getToken();
      const list = await getAdminStories(token);
      setStories(list);
    } catch (err) {
      setStoriesError((err as Error).message || "Failed to load stories");
    } finally {
      setStoriesLoading(false);
    }
  };

  useEffect(() => {
    void loadStories();
  }, []);

  const handleAddStory = async (payload: {
    story: string;
    name?: string;
    isAnonymous: boolean;
    status: StoryStatus;
  }) => {
    const token = await getToken();
    const created = await createStory(token, payload);
    setStories((prev) => [created, ...prev]);
    setShowAddStory(false);
  };

  const handleStatusChange = async (story: Story, status: StoryStatus) => {
    const previous = stories;
    setStories((prev) =>
      prev.map((s) => (s._id === story._id ? { ...s, status } : s)),
    );
    try {
      const token = await getToken();
      const updated = await updateStoryStatus(token, story._id, status);
      setStories((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
    } catch (err) {
      setStories(previous);
      setStoriesError((err as Error).message || "Failed to update story status");
    }
  };

  const handleDeleteStory = async () => {
    if (!deleteStoryTarget) return;
    try {
      const token = await getToken();
      await deleteStory(token, deleteStoryTarget._id);
      setStories((prev) => prev.filter((s) => s._id !== deleteStoryTarget._id));
    } catch (err) {
      setStoriesError((err as Error).message || "Failed to delete story");
      return;
    }
    setDeleteStoryTarget(null);
  };

  const loadPhotos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [heroList, scrapbookList] = await Promise.all([
        getCommunityPhotos("hero"),
        getCommunityPhotos("scrapbook"),
      ]);
      setHeroPhoto(heroList[0] ?? null);
      setScrapbookPhotos(scrapbookList);
    } catch (err) {
      setError((err as Error).message || "Failed to load community photos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPhotos();
  }, []);

  const handleHeroFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setHeroUploading(true);
    setError(null);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("image", file);

      const saved = heroPhoto
        ? await updateCommunityPhoto(token, heroPhoto._id, formData)
        : await uploadCommunityPhoto(
            token,
            (() => {
              formData.append("section", "hero");
              return formData;
            })(),
          );
      setHeroPhoto(saved);
    } catch (err) {
      setError((err as Error).message || "Failed to upload hero photo");
    } finally {
      setHeroUploading(false);
    }
  };

  const handleCreate = (created: CommunityPhoto) => {
    setScrapbookPhotos((prev) => [...prev, created]);
    setShowCreate(false);
  };

  const handleSaveEdit = (updated: CommunityPhoto) => {
    setScrapbookPhotos((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p)),
    );
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const token = await getToken();
      await deleteCommunityPhoto(token, deleteTarget._id);
      setScrapbookPhotos((prev) =>
        prev.filter((p) => p._id !== deleteTarget._id),
      );
    } catch (err) {
      setError((err as Error).message || "Failed to delete photo");
      return;
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="admin-community">
        {error && <p className="admin-community__error">{error}</p>}

        <div className="admin-community__card">
          <div className="admin-community__card-header">
            <span className="admin-community__card-title">Hero photo</span>
          </div>
          <div className="admin-community__hero">
            {heroPhoto ? (
              <img
                className="admin-community__hero-image"
                src={heroPhoto.imageUrl}
                alt="Hero"
              />
            ) : (
              <div
                className="admin-community__hero-image admin-community__hero-image--empty"
                aria-hidden="true"
              />
            )}
            <div>
              <p className="admin-community__hero-caption">
                Shown at the top of the public home page.
              </p>
              <button
                className="admin-community__add-btn"
                type="button"
                onClick={() => heroFileInputRef.current?.click()}
                disabled={heroUploading}
              >
                {heroUploading
                  ? "Uploading…"
                  : heroPhoto
                    ? "Replace photo"
                    : "Upload photo"}
              </button>
              <input
                ref={heroFileInputRef}
                className="admin-community__hidden-file-input"
                type="file"
                accept="image/*"
                onChange={handleHeroFileChange}
              />
            </div>
          </div>
        </div>

        <div className="admin-community__card">
          <div className="admin-community__card-header">
            <span className="admin-community__card-title">
              Community scrapbook
            </span>
            <button
              className="admin-community__add-btn"
              type="button"
              onClick={() => setShowCreate(true)}
              disabled={scrapbookPhotos.length >= MAX_SCRAPBOOK_PHOTOS}
            >
              + Add photo
            </button>
          </div>

          {loading && <p className="admin-community__status">Loading…</p>}
          {!loading && scrapbookPhotos.length === 0 && (
            <p className="admin-community__status">No scrapbook photos yet.</p>
          )}
          {!loading && scrapbookPhotos.length >= MAX_SCRAPBOOK_PHOTOS && (
            <p className="admin-community__status">
              Maximum of {MAX_SCRAPBOOK_PHOTOS} scrapbook photos reached.
            </p>
          )}

          {!loading && scrapbookPhotos.length > 0 && (
            <div className="admin-community__grid">
              {scrapbookPhotos.map((photo) => (
                <div key={photo._id} className="admin-community__grid-item">
                  <PolaroidCard
                    imageUrl={photo.imageUrl}
                    caption={photo.caption ?? ""}
                    date={photo.date ?? ""}
                  />
                  <div className="admin-community__grid-item-actions">
                    <button
                      className="admin-community__action-btn"
                      type="button"
                      aria-label="Edit photo"
                      onClick={() => setEditTarget(photo)}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      className="admin-community__action-btn admin-community__action-btn--danger"
                      type="button"
                      aria-label="Delete photo"
                      onClick={() => setDeleteTarget(photo)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-community__card">
          <div className="admin-community__card-header">
            <span className="admin-community__card-title">Student stories</span>
            <button
              className="admin-community__add-btn"
              type="button"
              onClick={() => setShowAddStory(true)}
            >
              + Add story
            </button>
          </div>

          {storiesError && (
            <p className="admin-community__error">{storiesError}</p>
          )}
          {storiesLoading && (
            <p className="admin-community__status">Loading…</p>
          )}
          {!storiesLoading && stories.length === 0 && (
            <p className="admin-community__status">No stories yet.</p>
          )}

          {!storiesLoading && stories.length > 0 && (
            <div className="admin-community__table-wrap">
              <table className="admin-community__table">
                <thead>
                  <tr>
                    <th>Message</th>
                    <th>Name</th>
                    <th>Date uploaded</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {stories.map((story) => (
                    <tr key={story._id}>
                      <td>
                        <p className="admin-community__table-message">
                          {story.story}
                        </p>
                        <button
                          className="admin-community__view-full-btn"
                          type="button"
                          onClick={() => setViewStoryTarget(story)}
                        >
                          View full text
                        </button>
                      </td>
                      <td>{story.isAnonymous ? "Anonymous" : story.name || "—"}</td>
                      <td>{formatDate(story.createdAt)}</td>
                      <td>
                        <select
                          className={`admin-community__status-select admin-community__status-select--${story.status}`}
                          value={story.status}
                          onChange={(e) =>
                            handleStatusChange(
                              story,
                              e.target.value as StoryStatus,
                            )
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="published">Published</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="admin-community__action-btn admin-community__action-btn--danger"
                          type="button"
                          aria-label="Delete story"
                          onClick={() => setDeleteStoryTarget(story)}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddStory && (
        <AddStoryModal
          onClose={() => setShowAddStory(false)}
          onSave={handleAddStory}
        />
      )}

      {deleteStoryTarget && (
        <DeleteConfirmModal
          onCancel={() => setDeleteStoryTarget(null)}
          onConfirm={handleDeleteStory}
          heading="Delete story?"
          body="This story will be permanently removed. This cannot be undone."
        />
      )}

      {viewStoryTarget && (
        <ViewStoryModal
          story={viewStoryTarget}
          onClose={() => setViewStoryTarget(null)}
        />
      )}

      {showCreate && (
        <EditCommunityPhotoModal
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}

      {editTarget && (
        <EditCommunityPhotoModal
          photo={editTarget}
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
  heading?: string;
  body?: string;
}> = ({
  onCancel,
  onConfirm,
  heading = "Delete photo?",
  body = "This scrapbook photo will be permanently removed. This cannot be undone.",
}) => {
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
        <p className="delete-confirm__heading">{heading}</p>
        <p className="delete-confirm__body">{body}</p>
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

const ViewStoryModal: React.FC<{
  story: Story;
  onClose: () => void;
}> = ({ story, onClose }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="delete-confirm-overlay"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="view-story-modal" role="dialog" aria-modal="true">
        <p className="delete-confirm__heading">
          {story.isAnonymous ? "Anonymous" : story.name || "—"}
        </p>
        <p className="view-story-modal__meta">
          {formatDate(story.createdAt)}
        </p>
        <p className="view-story-modal__body">{story.story}</p>
        <div className="delete-confirm__footer">
          <button
            className="delete-confirm__btn delete-confirm__btn--cancel"
            type="button"
            onClick={onClose}
          >
            Close
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

export default AdminCommunity;
