import { useEffect, useRef, useState } from "react";
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

const DEFAULT_TESTIMONIALS: { quote: string; author: string }[] = [
  {
    quote:
      "The quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog.",
    author: "Albert Einstein",
  },
  {
    quote:
      "The quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog.",
    author: "Albert Einstein",
  },
  {
    quote:
      "The quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog.",
    author: "Albert Einstein",
  },
];

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

  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqError, setFaqError] = useState<string | null>(null);
  const [savingFaqId, setSavingFaqId] = useState<string | null>(null);

  const [letterText, setLetterText] = useState("");
  const [letterClosing, setLetterClosing] = useState("Sincerely,");
  const [letterSignature, setLetterSignature] = useState("PPAC Eboard");
  const [letterLoading, setLetterLoading] = useState(true);
  const [letterSaving, setLetterSaving] = useState(false);
  const [letterError, setLetterError] = useState<string | null>(null);

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
      let list = await getTestimonials();
      if (list.length === 0) {
        const token = await getToken();
        list = await Promise.all(
          DEFAULT_TESTIMONIALS.map((defaults, index) =>
            createTestimonial(token, { ...defaults, order: index }),
          ),
        );
      }
      setTestimonials(list);
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
      setLetterText((data?.paragraphs ?? []).join("\n\n"));
      setLetterClosing(data?.closing ?? "Sincerely,");
      setLetterSignature(data?.signature ?? "PPAC Eboard");
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

  const handleSaveTestimonial = async (testimonial: Testimonial) => {
    setSavingTestimonialId(testimonial._id);
    setTestimonialsError(null);
    try {
      const token = await getToken();
      const saved = await updateTestimonial(token, testimonial._id, {
        quote: testimonial.quote,
        author: testimonial.author,
      });
      setTestimonials((current) =>
        current.map((t) => (t._id === saved._id ? saved : t)),
      );
    } catch (err) {
      setTestimonialsError(
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

  const handleAddFaqItem = async () => {
    setFaqError(null);
    try {
      const token = await getToken();
      const created = await createFaqItem(token, {
        question: "New question",
        answer: "New answer",
        order: faqItems.length,
      });
      setFaqItems((current) => [...current, created]);
    } catch (err) {
      setFaqError((err as Error).message || "Failed to add FAQ item");
    }
  };

  const handleSaveFaqItem = async (faqItem: FaqItem) => {
    setSavingFaqId(faqItem._id);
    setFaqError(null);
    try {
      const token = await getToken();
      const saved = await updateFaqItem(token, faqItem._id, {
        question: faqItem.question,
        answer: faqItem.answer,
      });
      setFaqItems((current) =>
        current.map((f) => (f._id === saved._id ? saved : f)),
      );
    } catch (err) {
      setFaqError((err as Error).message || "Failed to save FAQ item");
    } finally {
      setSavingFaqId(null);
    }
  };

  const handleDeleteFaqItem = async (id: string) => {
    setFaqError(null);
    const previous = faqItems;
    setFaqItems((current) => current.filter((f) => f._id !== id));
    try {
      const token = await getToken();
      await deleteFaqItem(token, id);
    } catch (err) {
      setFaqItems(previous);
      setFaqError((err as Error).message || "Failed to delete FAQ item");
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
      setLetterText((saved.paragraphs ?? []).join("\n\n"));
      setLetterClosing(saved.closing ?? "Sincerely,");
      setLetterSignature(saved.signature ?? "PPAC Eboard");
    } catch (err) {
      setLetterError(
        (err as Error).message || "Failed to save presidents letter",
      );
    } finally {
      setLetterSaving(false);
    }
  };

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
                </div>
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
          </div>
        )}
      </div>

      <div className="admin-home__card">
        <div className="admin-home__card-header">
          <span className="admin-home__card-title">FAQ</span>
          <button
            className="admin-home__add-btn"
            type="button"
            onClick={() => void handleAddFaqItem()}
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
                    onClick={() => void handleDeleteFaqItem(faqItem._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
