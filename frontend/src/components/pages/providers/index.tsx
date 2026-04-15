import ProviderCard from "../../molecules/card/ProviderCard";

const Providers: React.FC = () => {
  return (
    <div className="providers p-6 flex justify-center">
      <ProviderCard
        name="Isaac Newton"
        role="President"
      />
    </div>
  );
};

export default Providers;
