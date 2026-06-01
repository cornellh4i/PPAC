import React from 'react';
import './ResourceCard.scss';

interface BookLink {
  label: string;
  url: string;
}

interface ResourceCardProps {
  type: string;
  tag: string;
  title: string;
  file?: string;
  description: string;
  tags?: string[];
  readAt?: BookLink[];
  borrowAt?: BookLink[];
}

const TYPE_ACCENT: Record<string, string> = {
  website:           '#d0f0e8',
  podcast:           '#e8d0f0',
  book:              '#d0e8f0',
  'local resource':  '#f0e8d0',
  'local resources': '#f0e8d0',
  informational:     '#f0d0d8',
};

const TYPE_PILL_COLOR: Record<string, string> = {
  website:           '#d0f0e8',
  podcast:           '#e8d0f0',
  book:              '#d0e8f0',
  'local resource':  '#f0e8d0',
  'local resources': '#f0e8d0',
  informational:     '#f0d0d8',
};

const ResourceCard: React.FC<ResourceCardProps> = ({
  type,
  tag,
  title,
  file,
  description,
  tags = [],
  readAt,
  borrowAt,
}) => {
  const accentColor = TYPE_ACCENT[type.toLowerCase()] ?? '#e0e0e0';
  const pillColor   = TYPE_PILL_COLOR[type.toLowerCase()] ?? '#e0e0e0';
  const allTags     = tags.length ? tags : [tag];
  const typeKey     = type.toLowerCase();

  return (
    <article
      className="resource-card"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      <div className="resource-card__bar" />

      <div className="resource-card__body">
        {/* Title */}
        {file ? (
          <a
            className="resource-card__title"
            href={file}
            target="_blank"
            rel="noopener noreferrer"
          >
            {title}
          </a>
        ) : (
          <p className="resource-card__title resource-card__title--no-link">{title}</p>
        )}

        {/* Read online at (books) */}
        {readAt && readAt.length > 0 && (
          <p className="resource-card__link-row">
            <span className="resource-card__link-label">Read online at:</span>
            {readAt.map((l) => (
              <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="resource-card__link">
                {l.label}
              </a>
            ))}
          </p>
        )}

        {/* Borrow at (books) */}
        {borrowAt && borrowAt.length > 0 && (
          <p className="resource-card__link-row">
            <span className="resource-card__link-label">Borrow at:</span>
            {borrowAt.map((l) => (
              <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="resource-card__link">
                {l.label}
              </a>
            ))}
          </p>
        )}

        {/* URL for websites / podcasts */}
        {file && !readAt && (
          <p className="resource-card__url">{file}</p>
        )}

        {/* Tags */}
        <div className="resource-card__tags">
          {allTags.map((t) => (
            <span key={t} className="resource-card__tag">{t}</span>
          ))}
          <span
            className="resource-card__type-pill"
            style={{ background: pillColor }}
          >
            {type}
          </span>
        </div>

        {/* Description */}
        <p className="resource-card__description">{description}</p>
      </div>
    </article>
  );
};

export default ResourceCard;
