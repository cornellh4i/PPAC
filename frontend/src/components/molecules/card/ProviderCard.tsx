import "./ProviderCard.scss";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import ProviderModal from "../../organisms/ProviderModal/ProviderModal";

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
  role,
  imageUrl,
}: ProviderCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
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
          <Button variant="rect" onClick={() => setIsOpen(true)}>
            More
          </Button>
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
      />
    </>
  );
};

export default ProviderCard;
