import { useEffect, useMemo, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import DeleteConfirmModal from "../events/DeleteConfirmModal";
import { auth } from "../../../../firebase/config";
import {
  CommunityPhoto,
  getCommunityPhotos,
  uploadCommunityPhoto,
  updateCommunityPhoto,
} from "../community/communityApi";
import {
  Testimonial,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
} from "./testimonialsApi";
import {
  FaqItem,
  getFaqItems,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
} from "./faqApi";
import {
  getPresidentsLetter,
  updatePresidentsLetter,
} from "./presidentsLetterApi";
import "./index.scss";

const getToken = async (): Promise<string> => {
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not signed in");
  return currentUser.getIdToken();
};

// Items not saved to the server yet use ids with this prefix.
const DRAFT_PREFIX = "draft-";
const isDraftId = (id: string) => id.startsWith(DRAFT_PREFIX);
let draftCounter = 0;
const newDraftId = () => `${DRAFT_PREFIX}${Date.now()}-${draftCounter++}`;

// Number of testimonial slots on the public Home page carousel.
const TESTIMONIAL_SLOTS = 3;

const AdminHome: React.FC = () => {
  const [heroPhoto, setHeroPhoto] = useState<CommunityPhoto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(
    null
  );
  const [savingTestimonialId, setSavingTestimonialId] = useState<
    string | null
  >(null);
  // Per-item error messages, shown right under the item.
  const [testimonialErrors, setTestimonialErrors] = useState<Record<string, string>>({});
  // Last saved values per id, used to detect unsaved edits.
  const [savedTestimonials, setSavedTestimonials] = useState<
    Record<string, { quote: string; author: string }>
  >({});

  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqError, setFaqError] = useState<string | null>(null);
  const [savingFaqId, setSavingFaqId] = useState<string | null>(null);
  const [faqErrors, setFaqErrors] = useState<Record<string, string>>({});
  const [savedFaq, setSavedFaq] = useState<
    Record<string, { question: string; answer: string }>
  >({});
  const [faqDeleteTarget, setFaqDeleteTarget] = useState<FaqItem | null>(null);

  const [letterText, setLetterText] = useState("");
  const [letterClosing, setLetterClosing] = useState("Sincerely,");
  const [letterSignature, setLetterSignature] = useState("PPAC Eboard");
  const [letterLoading, setLetterLoading] = useState(true);
  const [letterSaving, setLetterSaving] = useState(false);
  const [letterError, setLetterError] = useState<string | null>(null);
  const [savedLetter, setSavedLetter] = useState({
    text: "",
    closing: "Sincerely,",
    signature: "PPAC Eboard",
  });

  const loadHeroPhoto = async () => {
    setLoading(true);
    setError(null);
    try {
      const heroList = await getCommunityPhotos("hero");
      setHeroPhoto(heroList[0] ?? null);
    } catch (err) {
      setError((err as Error).message || "Failed to load hero photo");
    } finally {
      setLoading(false);
    }
  };

  const loadTestimonials = async () => {
    setTestimonialsLoading(true);
    setTestimonialsError(null);
    try {
      const list = await getTestimonials();
      setSavedTestimonials(
        Object.fromEntries(list.map((t) => [t._id, { quote: t.quote, author: t.author }])),
      );
      // Fill empty slots with blank drafts. Nothing is published until the
      // admin fills one in and clicks Save.
      const drafts: Testimonial[] = Array.from(
        { length: Math.max(0, TESTIMONIAL_SLOTS - list.length) },
        (_, i) => ({ _id: newDraftId(), quote: "", author: "", order: list.length + i }),
      );
      setTestimonials([...list, ...drafts]);
    } catch (err) {
      setTestimonialsError(
        (err as Error).message || "Failed to load testimonials"
      );
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const loadFaqItems = async () => {
    setFaqLoading(true);
    setFaqError(null);
    try {
      const list = await getFaqItems();
      setFaqItems(list);
      setSavedFaq(
        Object.fromEntries(list.map((f) => [f._id, { question: f.question, answer: f.answer }])),
      );
    } catch (err) {
      setFaqError((err as Error).message || "Failed to load FAQ items");
    } finally {
      setFaqLoading(false);
    }
  };

  const loadLetter = async () => {
    setLetterLoading(true);
    setLetterError(null);
    try {
      const data = await getPresidentsLetter();
      const loaded = {
        text: (data?.paragraphs ?? []).join("\n\n"),
        closing: data?.closing ?? "Sincerely,",
        signature: data?.signature ?? "PPAC Eboard",
      };
      setLetterText(loaded.text);
      setLetterClosing(loaded.closing);
      setLetterSignature(loaded.signature);
      setSavedLetter(loaded);
    } catch (err) {
      setLetterError(
        (err as Error).message || "Failed to load presidents letter"
      );
    } finally {
      setLetterLoading(false);
    }
  };

  useEffect(() => {
    void loadHeroPhoto();
    void loadTestimonials();
    void loadFaqItems();
    void loadLetter();
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

  const handleTestimonialFieldChange = (
    id: string,
    field: "quote" | "author",
    value: string,
  ) => {
    setTestimonials((current) =>
      current.map((t) => (t._id === id ? { ...t, [field]: value } : t)),
    );
  };

  const setItemError = (
    setter: React.Dispatch<React.SetStateAction<Record<string, string>>>,
    id: string,
    message: string | null,
  ) =>
    setter((current) => {
      const next = { ...current };
      if (message) next[id] = message;
      else delete next[id];
      return next;
    });

  const isTestimonialDirty = (t: Testimonial) => {
    const saved = savedTestimonials[t._id];
    if (!saved) return Boolean(t.quote.trim() || t.author.trim());
    return saved.quote !== t.quote || saved.author !== t.author;
  };

  const handleSaveTestimonial = async (testimonial: Testimonial) => {
    if (!testimonial.quote.trim() || !testimonial.author.trim()) {
      setItemError(setTestimonialErrors, testimonial._id, "Quote and author are both required.");
      return;
    }
    setSavingTestimonialId(testimonial._id);
    setItemError(setTestimonialErrors, testimonial._id, null);
    try {
      const token = await getToken();
      const payload = { quote: testimonial.quote, author: testimonial.author };
      const saved = isDraftId(testimonial._id)
        ? await createTestimonial(token, { ...payload, order: testimonial.order })
        : await updateTestimonial(token, testimonial._id, payload);
      setTestimonials((current) =>
        current.map((t) => (t._id === testimonial._id ? saved : t)),
      );
      setSavedTestimonials((current) => ({
        ...current,
        [saved._id]: { quote: saved.quote, author: saved.author },
      }));
    } catch (err) {
      setItemError(
        setTestimonialErrors,
        testimonial._id,
        (err as Error).message || "Failed to save testimonial",
      );
    } finally {
      setSavingTestimonialId(null);
    }
  };

  const handleFaqFieldChange = (
    id: string,
    field: "question" | "answer",
    value: string,
  ) => {
    setFaqItems((current) =>
      current.map((f) => (f._id === id ? { ...f, [field]: value } : f)),
    );
  };

  const isFaqDirty = (f: FaqItem) => {
    const saved = savedFaq[f._id];
    if (!saved) return true; // a new, unsaved question
    return saved.question !== f.question || saved.answer !== f.answer;
  };

  // Adds a blank draft question; it is only published when saved.
  const handleAddFaqItem = () => {
    setFaqError(null);
    setFaqItems((current) => [
      ...current,
      { _id: newDraftId(), question: "", answer: "", order: current.length },
    ]);
  };

  const handleSaveFaqItem = async (faqItem: FaqItem) => {
    if (!faqItem.question.trim() || !faqItem.answer.trim()) {
      setItemError(setFaqErrors, faqItem._id, "Question and answer are both required.");
      return;
    }
    setSavingFaqId(faqItem._id);
    setItemError(setFaqErrors, faqItem._id, null);
    try {
      const token = await getToken();
      const payload = { question: faqItem.question, answer: faqItem.answer };
      const saved = isDraftId(faqItem._id)
        ? await createFaqItem(token, { ...payload, order: faqItem.order })
        : await updateFaqItem(token, faqItem._id, payload);
      setFaqItems((current) =>
        current.map((f) => (f._id === faqItem._id ? saved : f)),
      );
      setSavedFaq((current) => ({
        ...current,
        [saved._id]: { question: saved.question, answer: saved.answer },
      }));
    } catch (err) {
      setItemError(setFaqErrors, faqItem._id, (err as Error).message || "Failed to save FAQ item");
    } finally {
      setSavingFaqId(null);
    }
  };

  const handleDeleteFaqItem = async (faqItem: FaqItem) => {
    setFaqDeleteTarget(null);
    setFaqError(null);
    const previous = faqItems;
    setFaqItems((current) => current.filter((f) => f._id !== faqItem._id));
    if (isDraftId(faqItem._id)) return; // never saved, nothing to delete
    try {
      const token = await getToken();
      await deleteFaqItem(token, faqItem._id);
      setSavedFaq((current) => {
        const next = { ...current };
        delete next[faqItem._id];
        return next;
      });
    } catch (err) {
      setFaqItems(previous);
      setItemError(setFaqErrors, faqItem._id, (err as Error).message || "Failed to delete FAQ item");
    }
  };

  const handleSaveLetter = async () => {
    setLetterSaving(true);
    setLetterError(null);
    try {
      const token = await getToken();
      const paragraphs = letterText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      const saved = await updatePresidentsLetter(token, {
        paragraphs,
        closing: letterClosing,
        signature: letterSignature,
      });
      const savedValues = {
        text: (saved.paragraphs ?? []).join("\n\n"),
        closing: saved.closing ?? "Sincerely,",
        signature: saved.signature ?? "PPAC Eboard",
      };
      setLetterText(savedValues.text);
      setLetterClosing(savedValues.closing);
      setLetterSignature(savedValues.signature);
      setSavedLetter(savedValues);
    } catch (err) {
      setLetterError(
        (err as Error).message || "Failed to save presidents letter",
      );
    } finally {
      setLetterSaving(false);
    }
  };

  const letterDirty =
    !letterLoading &&
    (letterText !== savedLetter.text ||
      letterClosing !== savedLetter.closing ||
      letterSignature !== savedLetter.signature);

  const hasUnsavedChanges = useMemo(
    () =>
      letterDirty ||
      testimonials.some(isTestimonialDirty) ||
      faqItems.some(isFaqDirty),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [letterDirty, testimonials, savedTestimonials, faqItems, savedFaq],
  );

  // Warn before leaving with unsaved edits: browser reload/close...
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  // ...and in-app navigation (sidebar links, back button).
  const blocker = useBlocker(hasUnsavedChanges);
  // Ask once per blocked navigation. Depend on the state only: the blocker
  // object is new on every render, which would re-run this and ask twice.
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (window.confirm("You have unsaved changes on this page. Leave without saving?")) {
      blocker.proceed?.();
    } else {
      blocker.reset?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocker.state]);

  return (
    <div className="admin-home">
      {error && <p className="admin-home__error">{error}</p>}

      <div className="admin-home__card">
        <div className="admin-home__card-header">
          <span className="admin-home__card-title">Hero photo</span>
        </div>
        <div className="admin-home__hero">
          {loading ? (
            <div
              className="admin-home__hero-image admin-home__hero-image--empty"
              aria-hidden="true"
            />
          ) : heroPhoto ? (
            <img
              className="admin-home__hero-image"
              src={heroPhoto.imageUrl}
              alt="Hero"
            />
          ) : (
            <div
              className="admin-home__hero-image admin-home__hero-image--empty"
              aria-hidden="true"
            />
          )}
          <div>
            <p className="admin-home__hero-caption">
              Shown at the top of the public home page.
            </p>
            <button
              className="admin-home__add-btn"
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
              className="admin-home__hidden-file-input"
              type="file"
              accept="image/*"
              onChange={handleHeroFileChange}
            />
          </div>
        </div>
      </div>

      <div className="admin-home__card">
        <div className="admin-home__card-header">
          <span className="admin-home__card-title">
            What People Are Saying
          </span>
        </div>
        {testimonialsError && (
          <p className="admin-home__error">{testimonialsError}</p>
        )}
        {testimonialsLoading ? (
          <p className="admin-home__status">Loading…</p>
        ) : testimonials.length === 0 ? (
          <p className="admin-home__status">No testimonials yet.</p>
        ) : (
          <div className="admin-home__list">
            {testimonials.map((testimonial) => (
              <div className="admin-home__list-item" key={testimonial._id}>
                <label className="admin-home__field-label">Quote</label>
                <textarea
                  className="admin-home__textarea"
                  value={testimonial.quote}
                  onChange={(e) =>
                    handleTestimonialFieldChange(
                      testimonial._id,
                      "quote",
                      e.target.value,
                    )
                  }
                />
                <label className="admin-home__field-label">Author</label>
                <input
                  className="admin-home__input"
                  type="text"
                  value={testimonial.author}
                  onChange={(e) =>
                    handleTestimonialFieldChange(
                      testimonial._id,
                      "author",
                      e.target.value,
                    )
                  }
                />
                <div className="admin-home__list-item-actions">
                  <button
                    className="admin-home__save-btn"
                    type="button"
                    disabled={savingTestimonialId === testimonial._id}
                    onClick={() => void handleSaveTestimonial(testimonial)}
                  >
                    {savingTestimonialId === testimonial._id
                      ? "Saving…"
                      : "Save"}
                  </button>
                  {isTestimonialDirty(testimonial) && (
                    <span className="admin-home__unsaved">
                      {isDraftId(testimonial._id) ? "Not published yet" : "Unsaved changes"}
                    </span>
                  )}
                </div>
                {testimonialErrors[testimonial._id] && (
                  <p className="admin-home__item-error" role="alert">
                    {testimonialErrors[testimonial._id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-home__card">
        <div className="admin-home__card-header">
          <span className="admin-home__card-title">
            Letter From Our Presidents
          </span>
        </div>
        {letterError && <p className="admin-home__error">{letterError}</p>}
        {letterLoading ? (
          <p className="admin-home__status">Loading…</p>
        ) : (
          <div className="admin-home__letter-form">
            <label className="admin-home__field-label">
              Letter body (separate paragraphs with a blank line)
            </label>
            <textarea
              className="admin-home__textarea admin-home__textarea--tall"
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
            />
            <label className="admin-home__field-label">Closing</label>
            <input
              className="admin-home__input"
              type="text"
              value={letterClosing}
              onChange={(e) => setLetterClosing(e.target.value)}
            />
            <label className="admin-home__field-label">Signature</label>
            <input
              className="admin-home__input"
              type="text"
              value={letterSignature}
              onChange={(e) => setLetterSignature(e.target.value)}
            />
            <button
              className="admin-home__save-btn"
              type="button"
              disabled={letterSaving}
              onClick={() => void handleSaveLetter()}
            >
              {letterSaving ? "Saving…" : "Save letter"}
            </button>
            {letterDirty && <span className="admin-home__unsaved">Unsaved changes</span>}
          </div>
        )}
      </div>

      <div className="admin-home__card">
        <div className="admin-home__card-header">
          <span className="admin-home__card-title">FAQ</span>
          <button
            className="admin-home__add-btn"
            type="button"
            onClick={handleAddFaqItem}
          >
            + Add question
          </button>
        </div>
        {faqError && <p className="admin-home__error">{faqError}</p>}
        {faqLoading ? (
          <p className="admin-home__status">Loading…</p>
        ) : faqItems.length === 0 ? (
          <p className="admin-home__status">No FAQ items yet.</p>
        ) : (
          <div className="admin-home__list">
            {faqItems.map((faqItem) => (
              <div className="admin-home__list-item" key={faqItem._id}>
                <label className="admin-home__field-label">Question</label>
                <input
                  className="admin-home__input"
                  type="text"
                  value={faqItem.question}
                  onChange={(e) =>
                    handleFaqFieldChange(faqItem._id, "question", e.target.value)
                  }
                />
                <label className="admin-home__field-label">Answer</label>
                <textarea
                  className="admin-home__textarea"
                  value={faqItem.answer}
                  onChange={(e) =>
                    handleFaqFieldChange(faqItem._id, "answer", e.target.value)
                  }
                />
                <div className="admin-home__list-item-actions">
                  <button
                    className="admin-home__save-btn"
                    type="button"
                    disabled={savingFaqId === faqItem._id}
                    onClick={() => void handleSaveFaqItem(faqItem)}
                  >
                    {savingFaqId === faqItem._id ? "Saving…" : "Save"}
                  </button>
                  <button
                    className="admin-home__delete-btn"
                    type="button"
                    onClick={() =>
                      isDraftId(faqItem._id)
                        ? void handleDeleteFaqItem(faqItem)
                        : setFaqDeleteTarget(faqItem)
                    }
                  >
                    {isDraftId(faqItem._id) ? "Discard" : "Delete"}
                  </button>
                  {isFaqDirty(faqItem) && (
                    <span className="admin-home__unsaved">
                      {isDraftId(faqItem._id) ? "Not published yet" : "Unsaved changes"}
                    </span>
                  )}
                </div>
                {faqErrors[faqItem._id] && (
                  <p className="admin-home__item-error" role="alert">
                    {faqErrors[faqItem._id]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {faqDeleteTarget && (
        <DeleteConfirmModal
          heading="Delete question?"
          body={`"${faqDeleteTarget.question}" will be removed from the public Home page. This cannot be undone.`}
          onCancel={() => setFaqDeleteTarget(null)}
          onConfirm={() => void handleDeleteFaqItem(faqDeleteTarget)}
        />
      )}
    </div>
  );
};

export default AdminHome;
