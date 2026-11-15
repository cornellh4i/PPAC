import React, { useMemo, useState } from 'react';
import { Globe, Mic, BookOpen, MapPin, Info, MoreHorizontal, X } from 'lucide-react';
import './ResourceFilterCard.scss';

export interface ResourceFilterItem {
  id: string;
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
  // Distinct resource ids behind this option.
  ids: Set<string>;
  // For the "other" bucket: the real labels folded into it.
  members?: string[];
}

const OTHER = 'other';

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
  // Count distinct resources per label (items are one row per resource tag).
  const ids = resources.reduce<Record<string, Set<string>>>((total, resource) => {
    (total[resource[key]] ??= new Set()).add(resource.id);
    return total;
  }, {});
  return Object.entries(ids).map(([label, set]) => ({ label, count: set.size, ids: set }));
};

// Collapse any option with count < 2 (and any real "other" label) into a
// single "other" bucket that remembers which labels it stands for.
const collapseIntoOther = (options: FilterOption[]): FilterOption[] => {
  const main = options.filter((o) => o.count >= 2 && o.label !== OTHER);
  const rest = options.filter((o) => o.count < 2 || o.label === OTHER);
  if (rest.length > 0) {
    // Count each resource once, even if several of its tags fold into "other".
    const ids = new Set(rest.flatMap((o) => Array.from(o.ids)));
    main.push({
      label: OTHER,
      count: ids.size,
      ids,
      members: rest.map((o) => o.label),
    });
  }
  return main;
};

// Turns selected option labels into the real labels to filter on.
const expandLabels = (options: FilterOption[], selected: (label: string) => boolean) =>
  options.filter((o) => selected(o.label)).flatMap((o) => o.members ?? [o.label]);

// Maps real labels back to option labels (e.g. a folded tag -> "other").
const toOptionLabel = (options: FilterOption[], label: string) =>
  options.find((o) => o.members?.includes(label))?.label ?? label;

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
      ...selectedMediaTypes.map((t) =>
        getOptionKey('mediaTypes', toOptionLabel(mediaTypeOptions, t))
      ),
      ...selectedTags.map((t) => getOptionKey('topics', toOptionLabel(topicOptions, t))),
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
      expandLabels(mediaTypeOptions, (l) => selectedOptions.has(getOptionKey('mediaTypes', l))),
      expandLabels(topicOptions, (l) => selectedOptions.has(getOptionKey('topics', l)))
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