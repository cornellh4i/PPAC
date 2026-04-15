import "./ProviderModal.scss";
import { MapPin, Phone, Calendar, Shield, Star } from "lucide-react";

export type Availability = {
  day: string;
  time: string;
};

type ProviderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  field: string;
  location: string;
  availability: Availability[];
  insurance: string[];
  number: string;
  about: string;
  experience: string;
  rating?: number;
  imageUrl?: string;
  onBook?: () => void;
};

const ProviderModal = ({
  isOpen,
  onClose,
  name,
  field,
  location,
  availability,
  insurance,
  number,
  about,
  experience,
  rating,
  imageUrl,
  onBook,
}: ProviderModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="providerModal__overlay" onClick={onClose}>  
    <div className="providerModal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="providerModal__header">
          <div className="providerModal__headerLeft">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="providerModal__avatar" />
            ) : (
              <div className="providerModal__avatarFallback" />
            )}
            <div className="providerModal__nameBlock">
              <h2 className="providerModal__name">{name}</h2>
              <p className="providerModal__field">{field}</p>
            </div>
          </div>

          {rating !== undefined && (
            <div className="providerModal__rating">
              <Star size={16} fill="black" strokeWidth={0} />
              {rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="providerModal__grid">
          <div className="providerModal__infoBlock">
            <MapPin size={16} className="providerModal__infoIcon" />
            <div className="providerModal__infoText">
              <p className="providerModal__label">LOCATION</p>
              <p className="providerModal__value">{location}</p>
            </div>
          </div>

          <div className="providerModal__infoBlock">
            <Calendar size={16} className="providerModal__infoIcon" />
            <div className="providerModal__infoText">
              <p className="providerModal__label">AVAILABILITY</p>
              <p className="providerModal__value">
                {availability.map((slot, i) => (
                  <span key={i}>
                    {slot.day}, {slot.time}
                    {i < availability.length - 1 ? " | " : ""}
                  </span>
                ))}
              </p>
            </div>
          </div>

          <div className="providerModal__infoBlock">
            <Phone size={16} className="providerModal__infoIcon" />
            <div className="providerModal__infoText">
              <p className="providerModal__label">Number</p>
              <p className="providerModal__value">{number}</p>
            </div>
          </div>

          <div className="providerModal__infoBlock">
            <Shield size={16} className="providerModal__infoIcon" />
            <div className="providerModal__infoText">
              <p className="providerModal__label">INSURANCE</p>
              <div className="providerModal__badges">
                {insurance.map((item) => (
                  <span key={item} className="providerModal__badge">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="providerModal__section">
          <p className="providerModal__sectionLabel">ABOUT</p>
          <p className="providerModal__sectionText">{about}</p>
        </div>

        {/* Experience */}
        <div className="providerModal__section">
          <p className="providerModal__sectionLabel">EXPERIENCE</p>
          <p className="providerModal__sectionText">{experience}</p>
        </div>

        {/* Book Appointment */}
        <button className="providerModal__bookBtn" onClick={onBook}>
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default ProviderModal;