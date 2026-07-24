import { useEffect } from "react";

interface Props {
  onCancel: () => void;
  onConfirm: () => void;
  heading?: string;
  body?: string;
}

const DeleteConfirmModal: React.FC<Props> = ({
  onCancel,
  onConfirm,
  heading = "Delete event?",
  body = "This event will be permanently removed. This cannot be undone.",
}) => {
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="delete-confirm" role="dialog" aria-modal="true">
        <h3 className="delete-confirm__heading">{heading}</h3>
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

export default DeleteConfirmModal;
