import ProviderCard from "../../molecules/card/ProviderCard";
const Providers: React.FC = () => {
  return (
    <div className="providers p-6 flex justify-center">
      <ProviderCard
        name="NAME"
        field="Counseling & Psychology"
        location="110 Ho Plaza, Ithaca, NY"
        availability={[{ day: "Mon-Sat", time: "8 AM - 8 PM" }]}
        insurance={["Cornell SHP", "Self-pay"]}
        number="123-456-7890"
        about="On-campus support for all Cornell students."
        experience="Experienced in crisis intervention and long-term therapy."
      />
    </div>
  );
};

export default Providers;
