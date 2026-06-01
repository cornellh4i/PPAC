import React, { useMemo, useState } from 'react';
import { Globe, Mic, BookOpen, MapPin, Info, MoreHorizontal, X } from 'lucide-react';
import './ResourceFilterCard.scss';

export interface ResourceFilterItem {
  mediaType: string;
  topic: string;
}

interface ResourceFilterCardProps {
  resources: ResourceFilterItem[];
  selectedMediaTypes: string[];
  selectedTags: string[];
  onApply: (mediaTypes: string[], tags: string[]) => void;
  onClose: () => void;
}

interface FilterOption {
  label: string;
  count: number;
}

const MEDIA_TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  website:           { icon: <Globe size={14} />,          color: '#d0f0e8' },
  podcast:           { icon: <Mic size={14} />,            color: '#e8d0f0' },
  book:              { icon: <BookOpen size={14} />,       color: '#d0e8f0' },
  'local resource':  { icon: <MapPin size={14} />,         color: '#f0e8d0' },
  'local resources': { icon: <MapPin size={14} />,         color: '#f0e8d0' },
  informational:     { icon: <Info size={14} />,           color: '#f0d0d8' },
  other:             { icon: <MoreHorizontal size={14} />, color: '#e8e8e8' },
};

const countOptions = (
  resources: ResourceFilterItem[],
  key: keyof ResourceFilterItem
): FilterOption[] => {
  const counts = resources.reduce<Record<string, number>>((total, resource) => {
    total[resource[key]] = (total[resource[key]] ?? 0) + 1;
    return total;
  }, {});
  return Object.entries(counts).map(([label, count]) => ({ label, count }));
};

// Collapse any option with count < 2 into a single "Other" bucket
const collapseIntoOther = (options: FilterOption[]): FilterOption[] => {
  const main = options.filter((o) => o.count >= 2);
  const otherCount = options
    .filter((o) => o.count < 2)
    .reduce((sum, o) => sum + o.count, 0);
  if (otherCount > 0) {
    main.push({ label: 'other', count: otherCount });
  }
  return main;
};

const getOptionKey = (group: 'mediaTypes' | 'topics', label: string) =>
  `${group}:${label}`;

const ResourceFilterCard: React.FC<ResourceFilterCardProps> = ({
  resources,
  selectedMediaTypes,
  selectedTags,
  onApply,
  onClose,
}) => {
  const rawMediaTypeOptions = useMemo(
    () => countOptions(resources, 'mediaType'),
    [resources]
  );
  const rawTopicOptions = useMemo(
    () => countOptions(resources, 'topic'),
    [resources]
  );

  const mediaTypeOptions = useMemo(
    () => collapseIntoOther(rawMediaTypeOptions),
    [rawMediaTypeOptions]
  );
  const topicOptions = useMemo(
    () => collapseIntoOther(rawTopicOptions),
    [rawTopicOptions]
  );

  const allOptionKeys = useMemo(
    () => [
      ...mediaTypeOptions.map((o) => getOptionKey('mediaTypes', o.label)),
      ...topicOptions.map((o) => getOptionKey('topics', o.label)),
    ],
    [mediaTypeOptions, topicOptions]
  );

  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(() =>
    new Set([
      ...selectedMediaTypes.map((t) => getOptionKey('mediaTypes', t)),
      ...selectedTags.map((t) => getOptionKey('topics', t)),
    ])
  );

  const toggleOption = (optionKey: string) => {
    setSelectedOptions((cur) => {
      const next = new Set(cur);
      next.has(optionKey) ? next.delete(optionKey) : next.add(optionKey);
      return next;
    });
  };

  const handleSelectAll = () => setSelectedOptions(new Set(allOptionKeys));
  const handleReset = () => setSelectedOptions(new Set());

  const handleApply = () => {
    onApply(
      mediaTypeOptions
        .map((o) => o.label)
        .filter((l) => selectedOptions.has(getOptionKey('mediaTypes', l))),
      topicOptions
        .map((o) => o.label)
        .filter((l) => selectedOptions.has(getOptionKey('topics', l)))
    );
  };

  const renderMediaOption = (option: FilterOption) => {
    const optionKey = getOptionKey('mediaTypes', option.label);
    const icon = MEDIA_TYPE_ICONS[option.label.toLowerCase()];

    return (
      <label className="resource-filter-card__option" key={optionKey}>
        <input
          className="resource-filter-card__checkbox"
          type="checkbox"
          aria-label={option.label}
          checked={selectedOptions.has(optionKey)}
          onChange={() => toggleOption(optionKey)}
        />
        <span className="resource-filter-card__checkbox-mark" aria-hidden />
        {icon && (
          <span
            className="resource-filter-card__type-icon"
            style={{ background: icon.color }}
            aria-hidden
          >
            {icon.icon}
          </span>
        )}
        <span className="resource-filter-card__option-label">{option.label}</span>
        <span className="resource-filter-card__count">{option.count}</span>
      </label>
    );
  };

  const renderTopicOption = (option: FilterOption) => {
    const optionKey = getOptionKey('topics', option.label);
    return (
      <label className="resource-filter-card__option resource-filter-card__option--no-icon" key={optionKey}>
        <input
          className="resource-filter-card__checkbox"
          type="checkbox"
          aria-label={option.label}
          checked={selectedOptions.has(optionKey)}
          onChange={() => toggleOption(optionKey)}
        />
        <span className="resource-filter-card__checkbox-mark" aria-hidden />
        <span className="resource-filter-card__option-label">{option.label}</span>
        <span className="resource-filter-card__count">{option.count}</span>
      </label>
    );
  };

  return (
    <aside className="resource-filter-card" aria-label="Resource filters">

      {/* Filters title + close on same row */}
      <div className="resource-filter-card__header">
        <div className="resource-filter-card__title-row">
          <h3 className="resource-filter-card__title">Filters</h3>
          <button
            className="resource-filter-card__close"
            type="button"
            aria-label="Close filters"
            onClick={onClose}
          >
            <X size={18} strokeWidth={1.4} />
          </button>
        </div>
        <div className="resource-filter-card__actions">
          <button type="button" onClick={handleSelectAll}>Select all</button>
          <button type="button" onClick={handleReset}>Reset</button>
        </div>
      </div>

      <section className="resource-filter-card__group">
        <h3 className="resource-filter-card__group-title">Media type</h3>
        <div className="resource-filter-card__options">
          {mediaTypeOptions.map(renderMediaOption)}
        </div>
      </section>

      <section className="resource-filter-card__group">
        <h3 className="resource-filter-card__group-title">Content</h3>
        <div className="resource-filter-card__options">
          {topicOptions.map(renderTopicOption)}
        </div>
      </section>

      <button
        className="resource-filter-card__apply"
        type="button"
        onClick={handleApply}
      >
        Apply
      </button>
    </aside>
  );
};

export default ResourceFilterCard;