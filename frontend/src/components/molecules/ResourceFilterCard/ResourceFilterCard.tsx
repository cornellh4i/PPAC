import React, { useMemo, useState } from 'react';
import './ResourceFilterCard.scss';

export interface ResourceFilterItem {
  mediaType: string;
  topic: string;
}

interface ResourceFilterCardProps {
  resources: ResourceFilterItem[];
}

interface FilterOption {
  label: string;
  count: number;
}

const countOptions = (
  resources: ResourceFilterItem[],
  key: keyof ResourceFilterItem
): FilterOption[] => {
  const counts = resources.reduce<Record<string, number>>((total, resource) => {
    total[resource[key]] = (total[resource[key]] ?? 0) + 1;
    return total;}, {});
  return Object.entries(counts).map(([label, count]) => ({ label, count }));
};

const getOptionKey = (group: 'mediaTypes' | 'topics', label: string) =>
  `${group}:${label}`;

const ResourceFilterCard: React.FC<ResourceFilterCardProps> = ({
  resources,
}) => {
  const mediaTypeOptions = useMemo(
    () => countOptions(resources, 'mediaType'),
    [resources]
  );
  const topicOptions = useMemo(
    () => countOptions(resources, 'topic'),
    [resources]
  );
  const allOptionKeys = useMemo(
    () => [
      ...mediaTypeOptions.map((option) =>
        getOptionKey('mediaTypes', option.label)
      ),
      ...topicOptions.map((option) => getOptionKey('topics', option.label)),
    ],
    [mediaTypeOptions, topicOptions]
  );
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    () => new Set()
  );

  const toggleOption = (optionKey: string) => {
    setSelectedOptions((currentOptions) => {
      const nextOptions = new Set(currentOptions);

      if (nextOptions.has(optionKey)) {
        nextOptions.delete(optionKey);
      } else {
        nextOptions.add(optionKey);
      }

      return nextOptions;
    });
  };

  const handleSelectAll = () => {
    setSelectedOptions(new Set(allOptionKeys));
  };

  const handleReset = () => {
    setSelectedOptions(new Set());
  };

  const renderOption = (
    option: FilterOption,
    group: 'mediaTypes' | 'topics'
  ) => {
    const optionKey = getOptionKey(group, option.label);

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
        <span className="resource-filter-card__option-label">
          {option.label}
        </span>
        <span className="resource-filter-card__count">{option.count}</span>
      </label>
    );
  };

  return (
    <aside className="resource-filter-card" aria-label="Resource filters">
      <button
        className="resource-filter-card__close"
        type="button"
        aria-label="Close filters"
      />

      <div className="resource-filter-card__header">
        <h2 className="resource-filter-card__title">Filters</h2>
        <div className="resource-filter-card__actions">
          <button type="button" onClick={handleSelectAll}>
            Select all
          </button>
          <button type="button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <section className="resource-filter-card__group">
        <h3 className="resource-filter-card__group-title">Media type</h3>
        <div className="resource-filter-card__options">
          {mediaTypeOptions.map((option) => renderOption(option, 'mediaTypes'))}
        </div>
      </section>

      <section className="resource-filter-card__group">
        <h3 className="resource-filter-card__group-title">Topic</h3>
        <div className="resource-filter-card__options">
          {topicOptions.map((option) => renderOption(option, 'topics'))}
        </div>
      </section>

      <button className="resource-filter-card__apply" type="button">
        Apply
      </button>
    </aside>
  );
};

export default ResourceFilterCard;
