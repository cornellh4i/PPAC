import ProviderCard, { ProviderCardProps } from "../../molecules/ProviderCard/ProviderCard";
import { Search, Funnel } from "lucide-react";
import { useMemo, useState } from "react";
import femalePractIcon from "../../../assets/icons/female_pract.png";
import malePractIcon from "../../../assets/icons/male_pract.png";
import "./Providers.scss";

const DUMMY_PROVIDERS: ProviderCardProps[] = [
  {
    name: "Dr. Sarah Chen",
    field: "Counseling & Psychology",
    location: "110 Ho Plaza, Ithaca, NY",
    rating: 4.8,
    availability: [{ day: "Mon–Sat", time: "8 AM – 8 PM" }],
    insurance: ["Cornell SHP", "Self-pay"],
    number: "(607) 255-5155",
    about:
      "Dr. Chen specializes in anxiety, depression, and academic stress for undergraduate and graduate students. She creates a welcoming, judgment-free environment.",
    experience:
      "10+ years of experience in college counseling. Completed fellowship at Columbia University Counseling Center. Licensed Clinical Psychologist (NY).",
    imageUrl: femalePractIcon,
  },
  {
    name: "James Okafor, LCSW",
    field: "Mental Health & Wellness",
    location: "223 Gannett Health Center",
    rating: 4.6,
    availability: [{ day: "Mon–Sat", time: "8 AM – 8 PM" }],
    insurance: ["Cornell SHP", "Aetna", "Self-pay"],
    number: "(607) 255-5200",
    about:
      "James works with students navigating identity, cultural adjustment, and interpersonal challenges. He takes a strengths-based, culturally affirming approach.",
    experience:
      "8 years in university mental health. Former social worker at NYC Department of Education. Master's in Social Work from NYU.",
    imageUrl: malePractIcon,
  },
  {
    name: "Dr. Priya Nair",
    field: "Psychiatry",
    location: "110 Ho Plaza, Ithaca, NY",
    rating: 4.9,
    availability: [{ day: "Mon–Sat", time: "8 AM – 8 PM" }],
    insurance: ["Cornell SHP", "BlueCross", "United"],
    number: "(607) 255-5100",
    about:
      "Dr. Nair provides psychiatric evaluations and medication management for students with ADHD, mood disorders, and anxiety. She emphasizes a collaborative care model.",
    experience:
      "Board-certified psychiatrist with 12 years of clinical experience. Residency at Johns Hopkins Hospital. Research focus on ADHD in college populations.",
    imageUrl: femalePractIcon,
  },
  {
    name: "Marcus Rivera, LPC",
    field: "Substance Use & Recovery",
    location: "400 Computing & Communications Center",
    rating: 4.5,
    availability: [{ day: "Mon–Sat", time: "8 AM – 8 PM" }],
    insurance: ["Self-pay", "Cornell SHP"],
    number: "(607) 255-6789",
    about:
      "Marcus supports students in recovery and those exploring their relationship with substances. He offers individual counseling and facilitates peer support groups.",
    experience:
      "Licensed Professional Counselor with a certificate in addiction studies. 6 years working in university recovery programs. Former crisis counselor.",
    imageUrl: malePractIcon,
  },
  {
    name: "Dr. Amelia Brooks",
    field: "Sports & Performance Psychology",
    location: "Bartels Hall, Ithaca, NY",
    rating: 4.7,
    availability: [{ day: "Mon–Sat", time: "8 AM – 8 PM" }],
    insurance: ["Cornell SHP", "Aetna"],
    number: "(607) 255-4321",
    about:
      "Dr. Brooks works with student-athletes on performance anxiety, burnout, and the mental demands of competing at the collegiate level.",
    experience:
      "Certified Mental Performance Consultant (CMPC). 9 years working with NCAA Division I athletes. PhD in Sport & Exercise Psychology from Penn State.",
    imageUrl: femalePractIcon,
  },
];

const PROVIDER_FILTERS = [
  "All",
  "Reproductive Health",
  "Counseling & Psychology",
  "General Medicine",
];

const Providers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredProviders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return DUMMY_PROVIDERS.filter((provider) => {
      const matchesFilter =
        selectedFilter === "All" || provider.field === selectedFilter;
      const matchesQuery =
        !query ||
        provider.name.toLowerCase().includes(query) ||
        provider.field.toLowerCase().includes(query) ||
        provider.location.toLowerCase().includes(query);

      return matchesFilter && matchesQuery;
    });
  }, [searchQuery, selectedFilter]);

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
          <div key={provider.name} className="providers__card">
            <ProviderCard {...provider} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Providers;
