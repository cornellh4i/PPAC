import { useEffect, useMemo, useState } from 'react';

import ResourceFilterCard from '../../molecules/ResourceFilterCard/ResourceFilterCard';
import './index.scss';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface Resource {
  _id: string;
  title: string;
  type: string;
  description: string;
  file?: string;
  tags?: string[];
  createdAt?: string;
}

interface ResourcesResponse {
  success: boolean;
  data: Resource[];
}

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMediaTypes, setSelectedMediaTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch(`${API_URL}/api/resources`);
        const result: ResourcesResponse = await response.json();

        if (result.success) {
          setResources(result.data);
        }
      } catch {
        setError('Unable to load resources.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filterResources = resources.flatMap((resource) => {
    const tags = resource.tags?.length ? resource.tags : ['Resource'];

    return tags.map((tag) => ({
      mediaType: resource.type,
      topic: tag,
    }));
  });

  const visibleResources = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return [...resources]
      .sort((first, second) => {
        const firstDate = first.createdAt ? Date.parse(first.createdAt) : 0;
        const secondDate = second.createdAt ? Date.parse(second.createdAt) : 0;

        return secondDate - firstDate;
      })
      .filter((resource) => {
        const resourceTags = resource.tags || [];
        const matchesSearch =
          !normalizedSearch ||
          resource.title.toLowerCase().includes(normalizedSearch) ||
          resource.description.toLowerCase().includes(normalizedSearch);
        const matchesType =
          selectedMediaTypes.length === 0 ||
          selectedMediaTypes.includes(resource.type);
        const matchesTag =
          selectedTags.length === 0 ||
          resourceTags.some((tag) => selectedTags.includes(tag));

        return matchesSearch && matchesType && matchesTag;
      });
  }, [resources, searchQuery, selectedMediaTypes, selectedTags]);

  return (
    <div className="resources">
      <header className="resources__header">
        <h1 className="resources__title">Published Resources</h1>
      </header>

      <div className="resources__body">
        <div className="resources__toolbar">
          <button className="resources__pill-button" type="button">
            Recents
          </button>

          <div className="resources__toolbar-actions">
            <input
              className="resources__search"
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <button
              className="resources__filter-button"
              type="button"
              onClick={() => setShowFilters((current) => !current)}
            >
              <span className="resources__filter-icon" aria-hidden />
              Filters
            </button>
          </div>
        </div>

        <div
          className={
            showFilters
              ? 'resources__content'
              : 'resources__content resources__content--cards-only'
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

          <section>
            {!loading && !error && visibleResources.length > 0 && (
              <div className="resources__grid">
                {visibleResources.map((resource) => (
                  <ResourceCard
                    key={resource._id}
                    type={resource.type}
                    tag={resource.tags?.[0] || 'Resource'}
                    title={resource.title}
                    file={resource.file}
                    description={resource.description}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <p className="resources__contact">
          Can’t find what you’re looking for?{' '}
          <span className="resources__contact-link">Contact us!</span>
        </p>
      </div>
    </div>
  );
};

export default Resources;
