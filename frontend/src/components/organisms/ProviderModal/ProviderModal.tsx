import "./ProviderModal.scss";
import { MapPin, Phone, Calendar, Shield, Award, X } from "lucide-react";

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
  imageUrl,
  onBook,
}: ProviderModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="providerModal__overlay" onClick={onClose}>
      <div className="providerModal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="providerModal__closeBtn"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="providerModal__header">
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

        {/* Contact Information */}
        <div className="providerModal__section">
          <p className="providerModal__sectionTitle">
            <Award size={18} className="providerModal__sectionIcon" />
            Contact Information
          </p>

          <div className="providerModal__contactBox">
            <div className="providerModal__infoBlock">
              <MapPin size={16} className="providerModal__infoIcon" />
              <p className="providerModal__value">{location}</p>
            </div>

            <div className="providerModal__infoBlock">
              <Calendar size={16} className="providerModal__infoIcon" />
              <p className="providerModal__value">
                {availability.map((slot, i) => (
                  <span key={i}>
                    {slot.day}, {slot.time}
                    {i < availability.length - 1 ? " | " : ""}
                  </span>
                ))}
              </p>
            </div>

            <div className="providerModal__infoBlock">
              <Phone size={16} className="providerModal__infoIcon" />
              <p className="providerModal__value">{number}</p>
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className="providerModal__section">
          <p className="providerModal__sectionTitle">
            <Shield size={18} className="providerModal__sectionIcon" />
            Insurance
          </p>
          <div className="providerModal__badges">
            {insurance.map((item) => (
              <span key={item} className="providerModal__badge">
                {item}
              </span>
            ))}
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
