import "./StoryLetterCard.scss";

type StoryLetterCardProps = {
  story: string;
  name?: string | null;
  isAnonymous: boolean;
  rotation?: number;
};

const getInitial = (name?: string | null, isAnonymous?: boolean) => {
  if (isAnonymous || !name) return "A";
  return name.trim().charAt(0).toUpperCase();
};

const StoryLetterCard = ({ story, name, isAnonymous, rotation = 0 }: StoryLetterCardProps) => {
  const displayName = isAnonymous || !name ? "Anonymous" : name;

  return (
    <article className="storyLetterCard" style={{ transform: `rotate(${rotation}deg)` }}>
      <p className="storyLetterCard__text">{story}</p>
      <div className="storyLetterCard__author">
        <span className="storyLetterCard__avatar" aria-hidden="true">
          {getInitial(name, isAnonymous)}
        </span>
        <span className="storyLetterCard__name">{displayName}</span>
      </div>
    </article>
  );
};

export default StoryLetterCard;
