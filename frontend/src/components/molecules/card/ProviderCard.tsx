import "./ProviderCard.scss";
import { ArrowRight } from "lucide-react";

export type ProviderCardProps = {
  name: string;
  role: string;
  imageUrl?: string;
};

const ProviderCard = ({
  name,
  role,
  imageUrl,
}: ProviderCardProps) => {
  return (
    <article className="providerCard">
      {imageUrl ? (
        <img className="providerCard__image" src={imageUrl} alt={`${name} profile`} />
      ) : (
        <div className="providerCard__imageFallback" aria-hidden="true" />
      )}

      <div className="providerCard__content">
        <div className="providerCard__nameGroup">
          <h2 className="providerCard__name">{name}</h2>
          <p className="providerCard__role">{role}</p>
        </div>

        <button className="providerCard__action" type="button" aria-label={`View ${name}`}>
          <ArrowRight size={20} strokeWidth={3} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};

export default ProviderCard;
