import { useEffect, useMemo, useState } from "react";

import ResourceFilterCard from "../../molecules/ResourceFilterCard/ResourceFilterCard";
import ResourceCard from "../../molecules/ResourceCard/ResourceCard";
import "./index.scss";
import { RESOURCES, Resource } from "../../../resources";

const CATEGORY_PILLS = [
  { label: "Websites", types: ["website"], color: "#d0f0e8" },
  { label: "Podcasts", types: ["podcast"], color: "#e8d0f0" },
  { label: "Books", types: ["book"], color: "#d0e8f0" },
  {
    label: "Local Resources",
    types: ["local resource", "local resources"],
    color: "#f0e8d0",
  },
  { label: "and more...", types: ["informational"], color: "#f0d0d8" },
];

const Resources: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMediaTypes, setSelectedMediaTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activePill, setActivePill] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>(RESOURCES);
  const [loading, setLoading] = useState(false);

  const filterResources = useMemo(() => {
    return resources.flatMap((resource) => {
      const tags = resource.tags?.length ? resource.tags : ["Resource"];
      return tags.map((tag) => ({ mediaType: resource.type, topic: tag }));
    });
  }, [resources]);

  // Types currently selected by the pill (null = all)
  const pillTypes = useMemo(() => {
    if (!activePill) return null;
    const pill = CATEGORY_PILLS.find((p) => p.label === activePill);
    return pill ? new Set(pill.types) : null;
  }, [activePill]);

  const visibleResources = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    return [...resources]
      .sort((a, b) => {
        const aDate = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bDate = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bDate - aDate;
      })
      .filter((resource) => {
        const resourceTags = resource.tags || [];
        const matchesSearch =
          !normalizedSearch ||
          resource.title.toLowerCase().includes(normalizedSearch) ||
          resource.description.toLowerCase().includes(normalizedSearch) ||
          resourceTags.some((tag) =>
            tag.toLowerCase().includes(normalizedSearch),
          );
        const matchesType =
          selectedMediaTypes.length === 0 ||
          selectedMediaTypes.includes(resource.type);
        const matchesTag =
          selectedTags.length === 0 ||
          resourceTags.some((tag) => selectedTags.includes(tag));
        const matchesPill =
          !pillTypes || pillTypes.has(resource.type.toLowerCase());
        return matchesSearch && matchesType && matchesTag && matchesPill;
      });
  }, [resources, searchQuery, selectedMediaTypes, selectedTags, pillTypes]);

  const isEmpty = !loading && visibleResources.length === 0;

  const handlePillClick = (label: string) => {
    setActivePill((current) => (current === label ? null : label));
  };

  return (
    <div className="resources">
      <div className="resources__body">
        {/* ── Hero + pills ── */}
        <div className="resources__hero">
          <h1 className="resources__title">
            Curious about pelvic health? Learn more here.
          </h1>
          <div className="resources__pills">
            {CATEGORY_PILLS.map((pill) => (
              <button
                key={pill.label}
                type="button"
                className={`resources__pill${activePill === pill.label ? " resources__pill--active" : ""}`}
                style={{ "--pill-color": pill.color } as React.CSSProperties}
                onClick={() => handlePillClick(pill.label)}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Search row ── */}
        <div className="resources__toolbar">
          <div className="resources__search-box">
            <SearchIcon />
            <input
              id="resources-search"
              className="resources__search"
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search resources"
            />
          </div>
          <button
            className="resources__filter-button"
            type="button"
            onClick={() => setShowFilters((c) => !c)}
          >
            <FilterIcon />
            Filters
          </button>
        </div>

        {/* ── Content ── */}
        <div
          className={
            showFilters
              ? "resources__content"
              : "resources__content resources__content--list-only"
          }
        >
          {showFilters && (
            <ResourceFilterCard
              resources={filterResources}
              selectedMediaTypes={selectedMediaTypes}
              selectedTags={selectedTags}
              onApply={(mediaTypes, tags) => {
                setSelectedMediaTypes(mediaTypes);
                setSelectedTags(tags);
                setShowFilters(false);
              }}
              onClose={() => setShowFilters(false)}
            />
          )}

          <section aria-label="Resources list">
            {loading && <p className="resources__status">Loading resources…</p>}

            {isEmpty && (
              <div className="resources__empty">
                <svg
                  width="56"
                  height="56"
                  viewBox="0 0 56 56"
                  fill="none"
                  aria-hidden
                >
                  <rect
                    x="10"
                    y="6"
                    width="36"
                    height="44"
                    rx="3"
                    stroke="#c8c8c8"
                    strokeWidth="2"
                  />
                  <circle cx="22" cy="30" r="2" fill="#c8c8c8" />
                  <circle cx="34" cy="30" r="2" fill="#c8c8c8" />
                  <path
                    d="M22 40 Q28 36 34 40"
                    stroke="#c8c8c8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                <p className="resources__empty-label">
                  No results found. Try a different search.
                </p>
              </div>
            )}

            {!loading && visibleResources.length > 0 && (
              <div className="resources__list">
                {visibleResources.map((resource) => (
                  <ResourceCard
                    key={resource._id}
                    type={resource.type}
                    tag={resource.tags?.[0] ?? resource.type}
                    title={resource.title}
                    file={resource.file}
                    description={resource.description}
                    tags={resource.tags}
                    readAt={resource.readAt}
                    borrowAt={resource.borrowAt}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Footer ── */}
        <p className="resources__contact">
          Can't find what you're looking for?{" "}
          <a className="resources__contact-link" href="mailto:ppac@cornell.edu">
            Contact us!
          </a>{" "}
          <ExternalIcon />
        </p>
      </div>
    </div>
  );
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
    <circle cx="8" cy="8" r="5.5" stroke="#000" strokeWidth="1.4" />
    <path
      d="M12.5 12.5L16 16"
      stroke="#000"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
    <path
      d="M0 1h16M3 6h10M6 11h4"
      stroke="#000"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const ExternalIcon = () => (
  <svg
    style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }}
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden
  >
    <path
      d="M2 12L12 2M12 2H5M12 2V9"
      stroke="#000"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Resources;
