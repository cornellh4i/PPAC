import ProviderCard from "../../molecules/ProviderCard/ProviderCard";
import { Search, Funnel } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Provider, getProviders } from "../admin/providers/providersApi";
import { getAvatarIcon } from "../admin/providers/avatarOptions";
import "./Providers.scss";

const PROVIDER_FILTERS = [
  "All",
  "Reproductive Health",
  "Counseling & Psychology",
  "General Medicine",
];

const Providers: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  useEffect(() => {
    void (async () => {
      try {
        const list = await getProviders();
        setProviders(list);
      } catch (error) {
        console.error("Failed to load providers:", error);
      }
    })();
  }, []);

  const filteredProviders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return providers.filter((provider) => {
      const matchesFilter =
        selectedFilter === "All" || provider.field === selectedFilter;
      const matchesQuery =
        !query ||
        provider.name.toLowerCase().includes(query) ||
        provider.field.toLowerCase().includes(query) ||
        provider.location.toLowerCase().includes(query);

      return matchesFilter && matchesQuery;
    });
  }, [providers, searchQuery, selectedFilter]);

  return (
    <div className="providers">
      <h1 className="providers__title">Ithaca Providers</h1>
      <h2 className="providers__subtitle">
        Verified local healthcare providers who understand the needs of the student
        community.
      </h2>

      <div className="providers__controls">
        <div className="providers__search">
          <Search size={16} aria-hidden="true" />
          <input
            type="text"
            placeholder="Find the provider"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search providers"
          />
        </div>

        <div className="providers__filters">
          <button type="button" className="providers__filterIcon" aria-label="Filter providers">
            <Funnel size={16} aria-hidden="true" />
          </button>

          <div className="providers__chips" aria-label="Provider filters">
            {PROVIDER_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`providers__chip ${selectedFilter === filter ? "providers__chip--active" : ""}`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="providers__count">
        Showing <strong>{filteredProviders.length}</strong> verified providers
      </p>

      <div className="providers__grid">
        {filteredProviders.map((provider) => (
          <div key={provider._id} className="providers__card">
            <ProviderCard {...provider} imageUrl={getAvatarIcon(provider.avatar)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Providers;
