import "./ProviderCard.scss";
import Button from "../../atoms/Button/Button";
import { MapPin, Phone, Calendar, Shield } from "lucide-react";

export type Availability = {
  day: string;
  time: string;
};

export type ProviderCardProps = {
  name: string;
  field: string;
  location: string;
  availability: Availability[];
  insurance: string[];
  number: string;
  about: string;
  experience: string;
  imageUrl?: string;
};

const ProviderCard = ({
  name,
  field,
  location,
  availability,
  insurance,
  number,
  imageUrl,
}: ProviderCardProps) => {
  return (
    <article className="providerCard">
      <div className="providerCard__header">
        <div className="providerCard__avatarWrapper">
          {imageUrl ? (
            <img className="providerCard__avatarImage" src={imageUrl} alt={`${name} profile`} />
          ) : (
            <div className="providerCard__avatarFallback" />
          )}
        </div>

        <div className="providerCard__nameGroup">
          <h2 className="providerCard__name">{name}</h2>
          <p className="providerCard__field">{field}</p>
        </div>
      </div>

      <div className="providerCard__infoGrid">
        <div className="providerCard__infoColumn">
          <p className="providerCard__infoRow">
            <MapPin size={16} aria-hidden="true" />
            <span>{location}</span>
          </p>

          <p className="providerCard__infoRow">
            <Phone size={16} aria-hidden="true" />
            <span>{number}</span>
          </p>
        </div>

        <div className="providerCard__infoColumn">
          <p className="providerCard__infoRow">
            <Calendar size={16} aria-hidden="true" />
            <span>
              {availability.map((slot, i) => (
                <span key={i}>{slot.day}, {slot.time}{i < availability.length - 1 ? " | " : ""}</span>
              ))}
            </span>
          </p>

          <p className="providerCard__infoRow">
            <Shield size={16} aria-hidden="true" />
            <span className="providerCard__insurance">
              {insurance.map((item) => (
                <span className="providerCard__insuranceBadge" key={item}>
                  {item}
                </span>
              ))}
            </span>
          </p>
        </div>
      </div>

      <div className="providerCard__footer">
        <Button variant="rect">
          Book Appointment
        </Button>
        <Button variant="rect">
          More
        </Button>
      </div>
    </article>
  );
};

export default ProviderCard;
