import { ArrowRight } from "lucide-react";
import "./ProfileCard.scss";

type ProfileCardProps = {
  name: string;
  role: string;
  imageUrl?: string;
  linkedinUrl?: string;
};

const ProfileCard = ({ name, role, imageUrl, linkedinUrl }: ProfileCardProps) => {
  return (
    <article className="profileCard">
      {imageUrl ? (
        <img className="profileCard__image" src={imageUrl} alt={`${name} profile`} />
      ) : (
        <div className="profileCard__imageFallback" aria-hidden="true" />
      )}

      <div className="profileCard__imageTint" />
      <div className="profileCard__gradient" aria-hidden="true" />
      <div className="profileCard__content">
        <div>
          <h3 className="profileCard__name">{name}</h3>
          <p className="profileCard__role">{role}</p>
        </div>

        <button 
        className="profileCard__action"
        type="button" 
        onClick={() => {
          window.open(linkedinUrl);
        }} 
        aria-label={`Open ${name} profile`}
        >
          <ArrowRight size={18} strokeWidth={2.8} color="rgba(253, 224, 230)"/>
        </button>
      </div>
    </article>
  );
};

export default ProfileCard;
