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
    <div className="providerCard providerCard--provider">
      <h2 className="providerCard__name">{name}</h2>
      <p className="providerCard__rating">Rating: {rating}</p>
      <p className="providerCard__field">Field: {field}</p>
      <p className="providerCard__location">Location: {location}</p>

      <div className="providerCard__availability">
        <h3>Availability</h3>
        <ul>
          {availability.map((slot, index) => (
            <li key={index}>
              {slot.day}: {slot.time}
            </li>
          ))}
        </ul>
      </div>

      <div className="providerCard__insurance">
        <h3>Insurance</h3>
        <ul>
          {insurance.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>

      <p className="providerCard__number">Phone: {number}</p>
      <p className="providerCard__about">{about}</p>
      <p className="providerCard__experience">Experience: {experience}</p>
    </div>
  );
};

export default ProviderCard;