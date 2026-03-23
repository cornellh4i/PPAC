import "./ProviderCard.scss";

export type AvailabilitySlot = {
  day: string;
  time: string;
};

export type Availability = AvailabilitySlot[];

export type ProviderCardProps = {
  name: string;
  rating: number;
  field: string;
  location: string;
  availability: Availability;
  insurance: string[];
  number: number;
  about: string;
  experience: string;
};

const ProviderCard = ({
  name,
  rating,
  field,
  location,
  availability,
  insurance,
  number,
  about,
  experience,
}: ProviderCardProps) => {
  return (
    <div className="provider-card">
      <h2 className="provider-card__name">{name}</h2>
      <p className="provider-card__rating">Rating: {rating}</p>
      <p className="provider-card__field">Field: {field}</p>
      <p className="provider-card__location">Location: {location}</p>

      <div className="provider-card__availability">
        <h3>Availability</h3>
        <ul>
          {availability.map((slot, index) => (
            <li key={index}>
              {slot.day}: {slot.time}
            </li>
          ))}
        </ul>
      </div>

      <div className="provider-card__insurance">
        <h3>Insurance</h3>
        <ul>
          {insurance.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <p className="provider-card__number">Phone: {number}</p>
      <p className="provider-card__about">{about}</p>
      <p className="provider-card__experience">Experience: {experience}</p>
    </div>
  );
};

export default ProviderCard;