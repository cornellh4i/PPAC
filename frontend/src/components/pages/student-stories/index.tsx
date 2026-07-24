import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import Button from "../../atoms/Button/Button";
import PolaroidCard from "../../molecules/PolaroidCard/PolaroidCard";
import StoryLetterCard from "../../molecules/StoryLetterCard/StoryLetterCard";
import squaresIcon from "../../../assets/community/icons/squares.svg";
import notepadIcon from "../../../assets/community/icons/notepad.svg";
import flowerBookIcon from "../../../assets/community/icons/flower-book.svg";
import movingBoxPersonIcon from "../../../assets/community/icons/moving-box-person.svg";
import starIcon from "../../../assets/community/icons/star.svg";
import diamondIcon from "../../../assets/community/icons/diamond.svg";
import quoteIcon from "../../../assets/community/icons/quote.svg";
import heartIcon from "../../../assets/community/icons/heart.svg";
import leafIcon from "../../../assets/community/icons/leaf.svg";
import flowerIcon from "../../../assets/community/icons/flower.svg";
import flowerStemIcon from "../../../assets/community/icons/flower-w-stem.svg";
import circleIcon from "../../../assets/community/icons/circle.svg";
import ppacTeam1 from "../../../assets/community/images/ppac-team-1.jpg";
import ppacTeam2 from "../../../assets/community/images/ppac-team-2.jpg";
import ppacTeam3 from "../../../assets/community/images/ppac-team-3.jpg";
import ppacTeam4 from "../../../assets/community/images/ppac-team-4.jpg";
import "./index.scss";

interface Story {
  _id: string;
  story: string;
  name?: string | null;
  isAnonymous: boolean;
  createdAt?: string;
}

const API_BASE = process.env.REACT_APP_API_URL ?? "http://localhost:8000";

const SCRAPBOOK_PLACEHOLDERS = [
  { caption: "Shared Joy", date: "MARCH 2026", imageUrl: ppacTeam1 },
  { caption: "Shared Joy", date: "MARCH 2026", imageUrl: ppacTeam2 },
  { caption: "Shared Joy", date: "MARCH 2026", imageUrl: ppacTeam3 },
  { caption: "Shared Joy", date: "MARCH 2026", imageUrl: ppacTeam4 },
];

const ROTATIONS = [-3, 2, -2, 3, -2.5, 2.5];

const StudentStories: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrapbookPhotos, setScrapbookPhotos] = useState(SCRAPBOOK_PLACEHOLDERS);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stories`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const raw = json.data ?? json;
        setStories(raw);
      } catch (err) {
        console.error("Failed to fetch stories:", err);
        setError("Failed to load stories. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStories();

    const fetchScrapbookPhotos = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/community?section=scrapbook`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const raw: any[] = json.data ?? json;
        if (raw.length > 0) {
          setScrapbookPhotos(
            raw.map((p) => ({
              caption: p.caption || 'Shared Joy',
              date: p.date || '',
              imageUrl: p.imageUrl,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch scrapbook photos:', err);
      }
    };

    fetchScrapbookPhotos();
  }, []);

  return (
    <div className="student-stories">
      <section className="student-stories__intro">
        <img
          className="student-stories__sparkle"
          src={starIcon}
          alt=""
          aria-hidden="true"
        />
        <img
          className="student-stories__introIcon student-stories__introIcon--right"
          src={squaresIcon}
          alt=""
          aria-hidden="true"
        />
        <h1 className="student-stories__title">Community</h1>
        <p className="student-stories__subtitle">
          Here, we share our stories and uplift one another, reminding every
          student that they are never alone in their journey.
        </p>
      </section>

      <section className="student-stories__header">
        <img
          className="student-stories__headerIcon"
          src={notepadIcon}
          alt=""
          aria-hidden="true"
        />
        <h2 className="student-stories__headerTitle">Community Scrapbook</h2>
        <p className="student-stories__headerCaption">
          &ldquo;Moments of connection, captured in time.&rdquo;
        </p>
      </section>

      <section className="student-stories__scrapbook">
        <img
          className="student-stories__scrapbookIcon student-stories__scrapbookIcon--left"
          src={squaresIcon}
          alt=""
          aria-hidden="true"
        />
        <img
          className="student-stories__scrapbookIcon student-stories__scrapbookIcon--right"
          src={diamondIcon}
          alt=""
          aria-hidden="true"
        />
        <div className="student-stories__polaroidGrid">
          {scrapbookPhotos.map((item, index) => (
            <PolaroidCard
              key={index}
              imageUrl={item.imageUrl}
              caption={item.caption}
              date={item.date}
              rotation={ROTATIONS[index % ROTATIONS.length]}
            />
          ))}
        </div>
      </section>

      <section className="student-stories__header">
        <img
          className="student-stories__headerIcon"
          src={flowerBookIcon}
          alt=""
          aria-hidden="true"
        />
        <h2 className="student-stories__headerTitle">Student Stories</h2>
        <p className="student-stories__headerCaption">
          A living collection of folding and unfolding truths, shared to light
          the way for others.
        </p>
      </section>

      <section className="student-stories__letters">
        <img
          className="student-stories__lettersBg student-stories__lettersBg--quote"
          src={quoteIcon}
          alt=""
          aria-hidden="true"
        />
        <img
          className="student-stories__lettersBg student-stories__lettersBg--heart"
          src={heartIcon}
          alt=""
          aria-hidden="true"
        />
        <img
          className="student-stories__lettersBg student-stories__lettersBg--leaf"
          src={leafIcon}
          alt=""
          aria-hidden="true"
        />
        <img
          className="student-stories__lettersBg student-stories__lettersBg--flower"
          src={flowerIcon}
          alt=""
          aria-hidden="true"
        />
        <img
          className="student-stories__lettersBg student-stories__lettersBg--flowerStem"
          src={flowerStemIcon}
          alt=""
          aria-hidden="true"
        />
        <img
          className="student-stories__lettersBg student-stories__lettersBg--circle"
          src={circleIcon}
          alt=""
          aria-hidden="true"
        />

        <div className="student-stories__lettersHeader">
          <div>
            <h3 className="student-stories__lettersTitle">
              The Letter Archive
            </h3>
            <p className="student-stories__lettersCaption">
              Every story here is a witness to strength. Hover, explore, and
              find the words you might need today.
            </p>
          </div>
          <Button variant="rounded" className="student-stories__shareButton">
            <Mail size={16} strokeWidth={2} />
            Share Your Story
          </Button>
        </div>

        <img
          className="student-stories__lettersIcon"
          src={movingBoxPersonIcon}
          alt=""
          aria-hidden="true"
        />

        {loading && (
          <p className="student-stories__status">Loading stories...</p>
        )}
        {error && <p className="student-stories__status">{error}</p>}
        {!loading && !error && stories.length === 0 && (
          <p className="student-stories__status">
            No stories yet. Be the first to share yours.
          </p>
        )}

        {!loading && !error && stories.length > 0 && (
          <div className="student-stories__lettersGrid">
            {stories.map((story, index) => (
              <StoryLetterCard
                key={story._id}
                story={story.story}
                name={story.name}
                isAnonymous={story.isAnonymous}
                rotation={ROTATIONS[index % ROTATIONS.length]}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentStories;
