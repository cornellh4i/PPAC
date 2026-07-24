import "./PolaroidCard.scss";

type PolaroidCardProps = {
  imageUrl?: string;
  caption: string;
  date: string;
  rotation?: number;
};

const PolaroidCard = ({ imageUrl, caption, date, rotation = 0 }: PolaroidCardProps) => {
  return (
    <div className="polaroidCard" style={{ transform: `rotate(${rotation}deg)` }}>
      {imageUrl ? (
        <img className="polaroidCard__image" src={imageUrl} alt={caption} />
      ) : (
        <div className="polaroidCard__imagePlaceholder" aria-hidden="true" />
      )}
      <div className="polaroidCard__footer">
        <span className="polaroidCard__caption">{caption}</span>
        <span className="polaroidCard__date">{date}</span>
      </div>
    </div>
  );
};

export default PolaroidCard;
