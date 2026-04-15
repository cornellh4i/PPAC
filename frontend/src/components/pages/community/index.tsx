import ProviderCard from "../../molecules/card/ProviderCard";
import EventCard from "../../molecules/EventCard/EventCard";
import "./community.scss";

const Community: React.FC = () => {
  return (
    <div className="community">
      <ProviderCard
        name="Isaac Newton"
        role="President"
      />
      <EventCard
        title="3/20 Speaker Panel"
      />
    </div>
  );
};

export default Community;