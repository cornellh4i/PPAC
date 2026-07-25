import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import "./ShareStoryModal.scss";

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    story: string;
    name?: string;
    isAnonymous: boolean;
  }) => Promise<void>;
}

const ShareStoryModal = ({
  isOpen,
  onClose,
  onSubmit,
}: ShareStoryModalProps) => {
  const [story, setStory] = useState("");
  const [name, setName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setStory("");
    setName("");
    setIsAnonymous(false);
    setError("");
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!story.trim()) {
      setError("Please share a bit of your story before submitting.");
      return;
    }

    if (!isAnonymous && !name.trim()) {
      setError("Please add your name, or choose to post anonymously.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        story: story.trim(),
        name: isAnonymous ? undefined : name.trim(),
        isAnonymous,
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        (err as Error).message ||
          "We could not submit your story. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="shareStoryModal__overlay" onClick={resetAndClose}>
      <div
        className="shareStoryModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-story-heading"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="shareStoryModal__closeBtn"
          onClick={resetAndClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="shareStoryModal__success">
            <h2 id="share-story-heading" className="shareStoryModal__title">
              Thank you for sharing.
            </h2>
            <p className="shareStoryModal__subtitle">
              Your story has been submitted and will appear once it&apos;s
              reviewed by our team.
            </p>
            <button
              type="button"
              className="shareStoryModal__submitBtn"
              onClick={resetAndClose}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 id="share-story-heading" className="shareStoryModal__title">
              Share Your Story
            </h2>
            <p className="shareStoryModal__subtitle">
              Your words could be exactly what someone else needs to read today.
            </p>

            <form className="shareStoryModal__form" onSubmit={handleSubmit}>
              <label
                className="shareStoryModal__label"
                htmlFor="share-story-text"
              >
                Your story <span className="shareStoryModal__required">*</span>
              </label>
              <textarea
                id="share-story-text"
                className="shareStoryModal__textarea"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={6}
                placeholder="Share your experience..."
              />

              {!isAnonymous && (
                <>
                  <label
                    className="shareStoryModal__label"
                    htmlFor="share-story-name"
                  >
                    Your name{" "}
                    <span className="shareStoryModal__required">*</span>
                  </label>
                  <input
                    id="share-story-name"
                    className="shareStoryModal__input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name or initials"
                  />
                </>
              )}

              <label className="shareStoryModal__checkbox">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                Post anonymously
              </label>

              {error && <p className="shareStoryModal__error">{error}</p>}

              <button
                type="submit"
                className="shareStoryModal__submitBtn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Story"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ShareStoryModal;
