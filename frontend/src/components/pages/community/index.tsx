import { useEffect, useState } from "react";
import ProfileCard from "../../molecules/ProfileCard/ProfileCard";
import EventCard from "../../molecules/EventCard/EventCard";
import { TeamMember, getTeamMembers } from "../admin/team/teamApi";
import "./community.scss";

const Team: React.FC = () => {
  const [officers, setOfficers] = useState<TeamMember[]>([]);
  const [speakers, setSpeakers] = useState<TeamMember[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const members = await getTeamMembers();
        setOfficers(members.filter((m) => m.category === "officer"));
        setSpeakers(members.filter((m) => m.category === "speaker"));
      } catch (error) {
        console.error("Failed to load team members:", error);
      } finally {
        setLoaded(true);
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
        {loaded && officers.length === 0 && (
          <p className="community__empty">Officer profiles are coming soon.</p>
        )}
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
        {loaded && speakers.length === 0 && (
          <p className="community__empty">Speakers will be announced soon. Stay tuned!</p>
        )}
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
