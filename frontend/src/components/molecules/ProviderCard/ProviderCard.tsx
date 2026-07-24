import "./ProviderCard.scss";
import { MapPin, Phone, Calendar, Shield, User, CalendarCheck } from "lucide-react";
import { useState } from "react";
import ProviderModal from "../../organisms/ProviderModal/ProviderModal";

export type Availability = {
  day: string;
  time: string;
};

export type ProviderCardProps = {
  name: string;
  field: string;
  location: string;
  rating?: number;
  availability: Availability[];
  insurance: string[];
  number: string;
  about: string;
  experience: string;
  imageUrl?: string;
  bookingLink: string;
};

const ProviderCard = ({
  name,
  field,
  location,
  rating,
  availability,
  insurance,
  number,
  about,
  experience,
  imageUrl,
  bookingLink,
}: ProviderCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleBook = () => {
    window.open(bookingLink, "_blank", "noopener,noreferrer");
  };

  return (
    <>
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
          <button
            type="button"
            className="providerCard__footerLink"
            onClick={() => setIsOpen(true)}
          >
            <User size={16} aria-hidden="true" />
            View Profile
          </button>
          <button type="button" className="providerCard__footerLink" onClick={handleBook}>
            <CalendarCheck size={16} aria-hidden="true" />
            Book
          </button>
        </div>

      </article>

      {/* Modal */}
      <ProviderModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        name={name}
        field={field}
        location={location}
        rating={rating}
        availability={availability}
        insurance={insurance}
        number={number}
        about={about}
        experience={experience}
        imageUrl={imageUrl}
        onBook={handleBook}
      />
    </>
  );
};

export default ProviderCard;