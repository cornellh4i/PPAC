import ProviderCard, { ProviderCardProps } from "../../molecules/ProviderCard/ProviderCard";
import { Search, Funnel } from "lucide-react";
import { useState } from "react";
import "./Providers.scss";

const DUMMY_PROVIDERS: ProviderCardProps[] = [
  {
    name: "Dr. Sarah Chen",
    field: "Counseling & Psychology",
    location: "110 Ho Plaza, Ithaca, NY",
    rating: 4.8,
    availability: [{ day: "Mon–Wed", time: "9 AM – 5 PM" }],
    insurance: ["Cornell SHP", "Self-pay"],
    number: "(607) 255-5155",
    about:
      "Dr. Chen specializes in anxiety, depression, and academic stress for undergraduate and graduate students. She creates a welcoming, judgment-free environment.",
    experience:
      "10+ years of experience in college counseling. Completed fellowship at Columbia University Counseling Center. Licensed Clinical Psychologist (NY).",
  },
  {
    name: "James Okafor, LCSW",
    field: "Mental Health & Wellness",
    location: "223 Gannett Health Center",
    rating: 4.6,
    availability: [{ day: "Tue–Thu", time: "10 AM – 6 PM" }],
    insurance: ["Cornell SHP", "Aetna", "Self-pay"],
    number: "(607) 255-5200",
    about:
      "James works with students navigating identity, cultural adjustment, and interpersonal challenges. He takes a strengths-based, culturally affirming approach.",
    experience:
      "8 years in university mental health. Former social worker at NYC Department of Education. Master's in Social Work from NYU.",
  },
  {
    name: "Dr. Priya Nair",
    field: "Psychiatry",
    location: "110 Ho Plaza, Ithaca, NY",
    rating: 4.9,
    availability: [
      { day: "Mon", time: "8 AM – 12 PM" },
      { day: "Thu", time: "1 PM – 5 PM" },
    ],
    insurance: ["Cornell SHP", "BlueCross", "United"],
    number: "(607) 255-5100",
    about:
      "Dr. Nair provides psychiatric evaluations and medication management for students with ADHD, mood disorders, and anxiety. She emphasizes a collaborative care model.",
    experience:
      "Board-certified psychiatrist with 12 years of clinical experience. Residency at Johns Hopkins Hospital. Research focus on ADHD in college populations.",
  },
  {
    name: "Marcus Rivera, LPC",
    field: "Substance Use & Recovery",
    location: "400 Computing & Communications Center",
    rating: 4.5,
    availability: [{ day: "Wed–Fri", time: "11 AM – 7 PM" }],
    insurance: ["Self-pay", "Cornell SHP"],
    number: "(607) 255-6789",
    about:
      "Marcus supports students in recovery and those exploring their relationship with substances. He offers individual counseling and facilitates peer support groups.",
    experience:
      "Licensed Professional Counselor with a certificate in addiction studies. 6 years working in university recovery programs. Former crisis counselor.",
  },
  {
    name: "Dr. Amelia Brooks",
    field: "Sports & Performance Psychology",
    location: "Bartels Hall, Ithaca, NY",
    rating: 4.7,
    availability: [{ day: "Mon–Fri", time: "8 AM – 4 PM" }],
    insurance: ["Cornell SHP", "Aetna"],
    number: "(607) 255-4321",
    about:
      "Dr. Brooks works with student-athletes on performance anxiety, burnout, and the mental demands of competing at the collegiate level.",
    experience:
      "Certified Mental Performance Consultant (CMPC). 9 years working with NCAA Division I athletes. PhD in Sport & Exercise Psychology from Penn State.",
  },
  {
    name: "Linda Park, LMFT",
    field: "Couples & Relationship Counseling",
    location: "130 Day Hall, Ithaca, NY",
    rating: 4.4,
    availability: [{ day: "Tue & Thu", time: "12 PM – 8 PM" }],
    insurance: ["Self-pay", "Cornell SHP", "Cigna"],
    number: "(607) 255-9900",
    about:
      "Linda helps individuals and couples strengthen communication, navigate conflict, and build healthier relationships during the college years and beyond.",
    experience:
      "Licensed Marriage and Family Therapist with 7 years of experience. Trained in Emotionally Focused Therapy (EFT). Graduate of Cornell's Human Development program.",
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

        <button type="button" className="providers__filterIcon" aria-label="Filter providers">
          <Funnel size={16} aria-hidden="true" />
        </button>

        <div className="providers__chips" role="group" aria-label="Provider filters">
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

      <div className="providers__grid">
        {DUMMY_PROVIDERS.map((provider) => (
          <div key={provider.name} className="providers__card">
            <ProviderCard {...provider} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Providers;
