import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../atoms/Button/Button";

import heroPhoto from "../../../assets/home/hero-group-photo.jpg";
import eventIcon from "../../../assets/home/event-megaphone.png";
import resourcesIcon from "../../../assets/home/resources-clipboard.png";
import providersIcon from "../../../assets/home/providers-clinic.png";

import envelope1 from "../../../assets/home/envelope-1.png";
import envelope2 from "../../../assets/home/envelope-2.png";
import envelope3 from "../../../assets/home/envelope-3.png";
import envelope4 from "../../../assets/home/envelope-4.png";
import envelope5 from "../../../assets/home/envelope-5.png";

import "./index.scss";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

type Testimonial = {
  id: number;
  quote: string;
  author: string;
};

type SubmissionType =
  | "question"
  | "request"
  | "testimonial"
  | "event"
  | "partnership"
  | "other";

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "The quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog.",
    author: "Albert Einstein",
  },
  {
    id: 2,
    quote:
      "The quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog.",
    author: "Albert Einstein",
  },
  {
    id: 3,
    quote:
      "The quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog.",
    author: "Albert Einstein",
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [heroPhotoUrl, setHeroPhotoUrl] = useState(heroPhoto);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submissionType, setSubmissionType] =
    useState<SubmissionType>("question");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const [formError, setFormError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showPreviousTestimonial = () => {
    setActiveTestimonial((current) =>
      current === 0 ? testimonials.length - 1 : current - 1
    );
  };

  const showNextTestimonial = () => {
    setActiveTestimonial((current) =>
      current === testimonials.length - 1 ? 0 : current + 1
    );
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveTestimonial((current) =>
        current === testimonials.length - 1 ? 0 : current + 1
      );
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchHeroPhoto = async () => {
      try {
        const res = await fetch(`${API_URL}/api/community?section=hero`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const raw: any[] = json.data ?? json;
        if (raw.length > 0) setHeroPhotoUrl(raw[0].imageUrl);
      } catch (err) {
        console.error("Failed to fetch hero photo:", err);
      }
    };

    fetchHeroPhoto();
  }, []);

  const getTestimonialPosition = (
    testimonialIndex: number
  ): "left" | "center" | "right" => {
    const previousIndex =
      activeTestimonial === 0
        ? testimonials.length - 1
        : activeTestimonial - 1;

    if (testimonialIndex === activeTestimonial) {
      return "center";
    }

    if (testimonialIndex === previousIndex) {
      return "left";
    }

    return "right";
  };

  const handleAttachmentChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setFormError("");
    setStatusMessage("");

    if (!selectedFile) {
      setAttachment(null);
      return;
    }

    if (selectedFile.size > MAX_ATTACHMENT_SIZE) {
      setAttachment(null);
      setFormError(
        "The selected file is too large. Please choose a file under 10 MB."
      );

      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = "";
      }

      return;
    }

    setAttachment(selectedFile);
  };

  const removeAttachment = () => {
    setAttachment(null);

    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormError("");
    setStatusMessage("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError("Please fill out all required fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("submissionType", submissionType);
      formData.append("message", message.trim());

      if (attachment) {
        formData.append("attachment", attachment);
      }

      const response = await fetch(`${API_URL}/api/email`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      setStatusMessage("Your message was sent successfully.");
      setName("");
      setEmail("");
      setSubmissionType("question");
      setAttachment(null);
      setMessage("");

      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = "";
      }
    } catch {
      setFormError(
        "We could not send your message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="home">
      <section
        className="home__hero"
        aria-labelledby="home-hero-heading"
      >
        <div className="home__hero-content">
          <div className="home__hero-text">
            <div className="home__hero-copy">
              <h1
                id="home-hero-heading"
                className="home__hero-heading"
              >
                End the silence around chronic pelvic pain.
              </h1>

              <p className="home__hero-subtitle">
                Our community is dedicated to breaking stigma,
                sharing knowledge, and supporting those impacted by
                pelvic pain.
              </p>
            </div>

            <Button
              variant="outline"
              className="home__hero-cta"
              onClick={() => navigate("/events")}
            >
              See our work
            </Button>
          </div>

          <div className="home__hero-visual">
            <div
              className="home__hero-mat"
              aria-hidden="true"
            />

            <img
              className="home__hero-photo"
              src={heroPhotoUrl}
              alt="Members of the Pelvic Pain Association at Cornell"
            />
          </div>
        </div>
      </section>

      <section
        id="assist"
        className="home__assist"
        aria-labelledby="home-assist-heading"
      >
        <h2
          id="home-assist-heading"
          className="home__assist-heading"
        >
          How Can We Assist You?
        </h2>

        <div className="home__assist-grid">
          <article className="home__assist-card">
            <div className="home__assist-icon-area">
              <img
                className="home__assist-icon home__assist-icon--event"
                src={eventIcon}
                alt=""
                aria-hidden="true"
              />
            </div>

            <div className="home__assist-card-bottom">
              <h3 className="home__assist-card-title">
                3/20 Speaker Panel
              </h3>

              <div className="home__assist-actions home__assist-actions--event">
                <Button
                  variant="outline"
                  className="home__assist-button"
                  onClick={() => undefined}
                >
                  Sign up!
                </Button>

                <Button
                  variant="outline"
                  className="home__assist-button home__assist-button--arrow"
                  onClick={() => navigate("/events")}
                >
                  <span>All events</span>

                  <span
                    className="home__assist-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Button>
              </div>
            </div>
          </article>

          <article className="home__assist-card">
            <div className="home__assist-icon-area">
              <img
                className="home__assist-icon home__assist-icon--resources"
                src={resourcesIcon}
                alt=""
                aria-hidden="true"
              />
            </div>

            <div className="home__assist-card-bottom">
              <h3 className="home__assist-card-title">
                Resources
              </h3>

              <div className="home__assist-actions">
                <Button
                  variant="outline"
                  className="home__assist-button home__assist-button--arrow"
                  onClick={() => navigate("/resources")}
                >
                  <span>Read more</span>

                  <span
                    className="home__assist-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Button>
              </div>
            </div>
          </article>

          <article className="home__assist-card">
            <div className="home__assist-icon-area">
              <img
                className="home__assist-icon home__assist-icon--providers"
                src={providersIcon}
                alt=""
                aria-hidden="true"
              />
            </div>

            <div className="home__assist-card-bottom">
              <h3 className="home__assist-card-title">
                Providers
              </h3>

              <div className="home__assist-actions">
                <Button
                  variant="outline"
                  className="home__assist-button home__assist-button--arrow"
                  onClick={() => navigate("/providers")}
                >
                  <span>Read more</span>

                  <span
                    className="home__assist-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section
        className="home__testimonials"
        aria-labelledby="home-testimonials-heading"
      >
        <h2
          id="home-testimonials-heading"
          className="home__testimonials-heading"
        >
          What People Are Saying
        </h2>

        <div
          className="home__testimonial-carousel"
          aria-live="polite"
        >
          {testimonials.map((testimonial, index) => {
            const position =
              getTestimonialPosition(index);
            const isActive = position === "center";

            return (
              <button
                key={testimonial.id}
                type="button"
                className={`home__testimonial-card home__testimonial-card--${position}`}
                onClick={() => {
                  if (position === "left") {
                    showPreviousTestimonial();
                  }

                  if (position === "right") {
                    showNextTestimonial();
                  }
                }}
                aria-label={
                  isActive
                    ? `Current testimonial from ${testimonial.author}`
                    : `Show testimonial from ${testimonial.author}`
                }
                aria-current={
                  isActive ? "true" : undefined
                }
              >
                <blockquote className="home__testimonial-quote">
                  “{testimonial.quote}”
                </blockquote>

                <p className="home__testimonial-author">
                  <span aria-hidden="true">•</span>
                  {testimonial.author}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section
        className="home__presidents"
        aria-labelledby="home-presidents-heading"
      >
        <h2
          id="home-presidents-heading"
          className="home__presidents-heading"
        >
          A Letter From Our Presidents
        </h2>

        <div
          className="home__letter-scene"
          tabIndex={0}
          aria-label="Hover or focus to reveal a letter from the PPAC presidents"
        >
          <article className="home__letter-card">
            <div className="home__letter-copy">
              <p>
                The Pelvic Pain Association at Cornell is
                committed to raising awareness, reducing stigma,
                and improving education surrounding pelvic pain
                and reproductive health conditions. Pelvic pain
                spans across conditions like endometriosis, PCOS,
                vulvodynia, and other various chronic disorders,
                and affects 1 out of 7 women of childbearing age in
                the United States.
              </p>

              <p>
                However, reproductive health issues remain widely
                misunderstood and underdiagnosed. Many people
                experience diagnosis delays, limited access to
                care, and challenges in navigating their academic,
                personal, and social life because of their
                symptoms. At PPAC, we hope to address these gaps
                through our three pillars: advocacy, education,
                and community-building. We host monthly
                educational workshops, collaborate with campus
                and community organizations, and create spaces
                for open conversation around pelvic pain and
                reproductive health. We aim to empower individuals
                with knowledge, connect them to resources in the
                Cornell and Ithaca community, and foster a
                supportive and informed community.
              </p>

              <p>
                In collaboration with Hack4Impact at Cornell, this
                website serves as a centralized hub for our
                initiatives, educational resources, and
                opportunities to get involved. By combining
                advocacy with technology, we aim to make pelvic
                pain and reproductive health education more
                accessible and continue pushing for meaningful
                change in how these conditions are understood and
                treated.
              </p>
            </div>

            <div className="home__letter-signature">
              <p>Sincerely,</p>
              <p>PPAC Eboard</p>
            </div>
          </article>

          <img
            className="home__envelope home__envelope--1"
            src={envelope1}
            alt=""
            aria-hidden="true"
          />

          <img
            className="home__envelope home__envelope--2"
            src={envelope2}
            alt=""
            aria-hidden="true"
          />

          <img
            className="home__envelope home__envelope--3"
            src={envelope3}
            alt=""
            aria-hidden="true"
          />

          <img
            className="home__envelope home__envelope--4"
            src={envelope4}
            alt=""
            aria-hidden="true"
          />

          <img
            className="home__envelope home__envelope--5"
            src={envelope5}
            alt=""
            aria-hidden="true"
          />
        </div>
      </section>

      <section
        id="contact"
        className="home__contact-faq"
        aria-label="Contact form and frequently asked questions"
      >
        <div className="home__contact-panel">
          <header className="home__contact-header">
            <h2 className="home__contact-title">
              We’d Love To Hear From You.
            </h2>

            <p className="home__contact-intro">
              Whether you have any questions, requests, or just
              want to chat, we’d be happy to talk.
            </p>
          </header>

          <form
            className="home__contact-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="home__contact-field">
              <label
                className="home__contact-label"
                htmlFor="contact-name"
              >
                Name{" "}
                <span className="home__required-mark">
                  *
                </span>
              </label>

              <input
                id="contact-name"
                className="home__contact-input"
                type="text"
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setFormError("");
                }}
              />
            </div>

            <div className="home__contact-field">
              <label
                className="home__contact-label"
                htmlFor="contact-email"
              >
                Email address{" "}
                <span className="home__required-mark">
                  *
                </span>
              </label>

              <input
                id="contact-email"
                className="home__contact-input"
                type="email"
                placeholder="e.g. jane.doe@gmail.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFormError("");
                }}
              />
            </div>

            <div className="home__contact-field">
              <label
                className="home__contact-label"
                htmlFor="submission-type"
              >
                Type of submission
              </label>

              <div className="home__select-wrapper">
                <select
                  id="submission-type"
                  className="home__contact-select"
                  value={submissionType}
                  onChange={(event) => {
                    setSubmissionType(
                      event.target.value as SubmissionType
                    );
                    setFormError("");
                  }}
                >
                  <option value="question">
                    General question
                  </option>

                  <option value="request">
                    Request
                  </option>

                  <option value="testimonial">
                    Share a testimonial
                  </option>

                  <option value="event">
                    Event inquiry
                  </option>

                  <option value="partnership">
                    Partnership or collaboration
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              </div>
            </div>

            <div className="home__contact-field">
              <span className="home__contact-label">
                Attachment
              </span>

              <label
                className={`home__file-upload ${
                  attachment
                    ? "home__file-upload--selected"
                    : ""
                }`}
                htmlFor="contact-attachment"
              >
                <span
                  className="home__file-upload-icon"
                  aria-hidden="true"
                >
                  ↑
                </span>

                <span className="home__file-upload-copy">
                  <span className="home__file-upload-title">
                    {attachment
                      ? attachment.name
                      : "Upload a file or image"}
                  </span>

                  <span className="home__file-upload-help">
                    PNG, JPG, PDF, DOC, or DOCX up to 10 MB
                  </span>
                </span>

                <span className="home__file-upload-action">
                  Browse
                </span>
              </label>

              <input
                ref={attachmentInputRef}
                id="contact-attachment"
                className="home__file-input"
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,image/png,image/jpeg,application/pdf"
                onChange={handleAttachmentChange}
              />

              {attachment && (
                <button
                  type="button"
                  className="home__remove-file"
                  onClick={removeAttachment}
                >
                  Remove attachment
                </button>
              )}
            </div>

            <div className="home__contact-field">
              <label
                className="home__contact-label"
                htmlFor="contact-message"
              >
                How can we help?{" "}
                <span className="home__required-mark">
                  *
                </span>
              </label>

              <textarea
                id="contact-message"
                className="home__contact-textarea"
                placeholder="Ask us a question or share a thought."
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setFormError("");
                }}
              />
            </div>

            <div className="home__contact-form-footer">
              <div
                className="home__contact-feedback"
                aria-live="polite"
              >
                {formError && (
                  <p className="home__contact-error">
                    {formError}
                  </p>
                )}

                {statusMessage && (
                  <p className="home__contact-success">
                    {statusMessage}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="home__contact-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>

        <aside
          className="home__faq-panel"
          aria-labelledby="home-faq-heading"
        >
          <h2
            id="home-faq-heading"
            className="home__faq-title"
          >
            FAQ.
          </h2>

          <div className="home__faq-list">
            <article className="home__faq-item">
              <h3 className="home__faq-question">
                Where do we meet?
              </h3>

              <div className="home__faq-answer">
                <p>
                  E-board meetings are{" "}
                  <span className="home__faq-highlight">
                    every Tuesday @ 3 pm Phillips Hall 200.
                  </span>
                </p>

                <p>
                  G-body meetings take place{" "}
                  <span className="home__faq-highlight">
                    every Tuesday @ 5 pm Upson Hall 420.
                  </span>
                </p>
              </div>
            </article>

            <article className="home__faq-item">
              <h3 className="home__faq-question">
                What is PPAC’s mission?
              </h3>

              <div className="home__faq-answer">
                <p>
                  Our club aims to raise awareness about pelvic
                  pain, reduce stigma, and create a supportive
                  educational space. We focus on learning,
                  advocacy, resource-sharing, and helping students
                  feel less alone when discussing pelvic health.
                </p>
              </div>
            </article>

            <article className="home__faq-item">
              <h3 className="home__faq-question">
                Do I need to have pelvic pain to join?
              </h3>

              <div className="home__faq-answer">
                <p>
                  No. Anyone interested in learning about pelvic
                  health, chronic pain, healthcare advocacy,
                  public health, or patient support is welcome to
                  join.
                </p>
              </div>
            </article>

            <article className="home__faq-item">
              <h3 className="home__faq-question">
                Is this club only for medical or pre-health
                students?
              </h3>

              <div className="home__faq-answer">
                <p>
                  No. While pre-health students may be interested,
                  this club is open to everyone. Pelvic pain is
                  connected to healthcare, education, stigma,
                  mental health, accessibility, and advocacy, so
                  students from many backgrounds can contribute.
                </p>
              </div>
            </article>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default Home;