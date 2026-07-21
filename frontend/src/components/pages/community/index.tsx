import ProfileCard from "../../molecules/ProfileCard/ProfileCard";
import EventCard from "../../molecules/EventCard/EventCard";
import officer1 from "../../../assets/team/asmita-mittal-headshot.png";
import officer2 from "../../../assets/team/gracie-luong-headshot.jpg";
import officer3 from "../../../assets/team/marianna-hodgins-headshot.jpg";
import officer4 from "../../../assets/team/gillian-goldstein-headshot.jpg";
import "./community.scss";

const officerData = [
  {name: "Asmita Mittal", role: "President", imageUrl: officer1, linkedinUrl: "https://www.linkedin.com/in/asmita-mittal/"},
  {name: "Gracie Luong", role: "Vice President", imageUrl: officer2, linkedinUrl: "https://www.linkedin.com/in/gracie-luong/"},
  {name: "Marianna Hodgins", role: "Secretary", imageUrl: officer3, linkedinUrl: "https://www.linkedin.com/in/marianna-hodgins-48684631a/"},
  {name: "Gillian Goldstein", role: "Treasurer", imageUrl: officer4, linkedinUrl: "https://www.linkedin.com/in/gillian-goldstein-338a57395/"}
];

const officers = officerData.map((officer, index) => ({
  id: `officer-${index + 1}`,
  ...officer,
}));

const speakers = Array.from({ length: 3 }, (_, index) => ({
  id: `speaker-${index + 1}`,
  name: "Corey Dresen",
  role: "Physical Therapist",
}));

const Team: React.FC = () => {
  return (
    <div className="community">
      <section className="community__intro">
        <h1 className="community__title">A Team of People Who Care.</h1>
      </section>

      <section className="community__section">
        <h2 className="community__heading">Our Officers</h2>
        <div className="community__grid">
          {officers.map((officer) => (
            <ProfileCard 
              key={officer.id} 
              name={officer.name} 
              role={officer.role} 
              imageUrl={officer.imageUrl}
              linkedinUrl={officer.linkedinUrl}
            />
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

export default Team;
