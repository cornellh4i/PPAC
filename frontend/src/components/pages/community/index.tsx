import ProfileCard from "../../molecules/ProfileCard/ProfileCard";
import "./community.scss";

const officers = Array.from({ length: 9 }, (_, index) => ({
  id: `officer-${index + 1}`,
  name: "Isaac Newton",
  role: "President",
}));

const speakers = Array.from({ length: 6 }, (_, index) => ({
  id: `speaker-${index + 1}`,
  name: "Isaac Newton",
  role: "President",
}));

const Community: React.FC = () => {
  return (
    <div className="community">
      <section className="community__intro">
        <h1 className="community__title">A Team of People Who Care.</h1>
        <p className="community__subtitle">We care about you and all that stuff subtitle</p>
      </section>

      <section className="community__section">
        <h2 className="community__heading">Our Officers</h2>
        <div className="community__grid">
          {officers.map((officer) => (
            <ProfileCard key={officer.id} name={officer.name} role={officer.role} />
          ))}
        </div>
      </section>

      <section className="community__section">
        <h2 className="community__heading">Our Speakers</h2>
        <div className="community__grid">
          {speakers.map((speaker) => (
            <ProfileCard key={speaker.id} name={speaker.name} role={speaker.role} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Community;