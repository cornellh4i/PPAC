import { useEffect, useRef, useState } from "react";

interface AddStoryModalProps {
  onClose: () => void;
  onSave: (payload: {
    story: string;
    name?: string;
    isAnonymous: boolean;
    status: "pending" | "published";
  }) => Promise<void> | void;
}

const AddStoryModal: React.FC<AddStoryModalProps> = ({ onClose, onSave }) => {
  const [story, setStory] = useState("");
  const [name, setName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story.trim()) {
      setError("Story text is required");
      return;
    }
    if (!isAnonymous && !name.trim()) {
      setError("Name is required unless the story is anonymous");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({
        story: story.trim(),
        name: isAnonymous ? undefined : name.trim(),
        isAnonymous,
        status: publishImmediately ? "published" : "pending",
      });
    } catch (err) {
      setError((err as Error).message || "Failed to save story");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="delete-confirm-overlay"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="add-story-modal" role="dialog" aria-modal="true">
        <p className="delete-confirm__heading">Add a story</p>
        <form onSubmit={handleSubmit}>
          <label className="add-story-modal__label" htmlFor="story-text">
            Story
          </label>
          <textarea
            id="story-text"
            className="add-story-modal__textarea"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={5}
          />

          <label className="add-story-modal__checkbox">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            Post anonymously
          </label>

          {!isAnonymous && (
            <>
              <label className="add-story-modal__label" htmlFor="story-name">
                Name
              </label>
              <input
                id="story-name"
                className="add-story-modal__input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </>
          )}

          <label className="add-story-modal__checkbox">
            <input
              type="checkbox"
              checked={publishImmediately}
              onChange={(e) => setPublishImmediately(e.target.checked)}
            />
            Publish immediately
          </label>

          {error && <p className="admin-community__error">{error}</p>}

          <div className="delete-confirm__footer">
            <button
              className="delete-confirm__btn delete-confirm__btn--cancel"
              type="button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="admin-community__add-btn"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStoryModal;
