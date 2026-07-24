import { useEffect, useState } from "react";
import ProfileCard from "../../molecules/ProfileCard/ProfileCard";
import EventCard from "../../molecules/EventCard/EventCard";
import { TeamMember, getTeamMembers } from "../admin/team/teamApi";
import "./community.scss";

const Team: React.FC = () => {
  const [officers, setOfficers] = useState<TeamMember[]>([]);
  const [speakers, setSpeakers] = useState<TeamMember[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const members = await getTeamMembers();
        setOfficers(members.filter((m) => m.category === "officer"));
        setSpeakers(members.filter((m) => m.category === "speaker"));
      } catch (error) {
        console.error("Failed to load team members:", error);
      }
    })();
  }, []);

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
              key={officer._id}
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
            <ProfileCard
              key={speaker._id}
              name={speaker.name}
              role={speaker.role}
              imageUrl={speaker.imageUrl}
              linkedinUrl={speaker.linkedinUrl}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Team;
