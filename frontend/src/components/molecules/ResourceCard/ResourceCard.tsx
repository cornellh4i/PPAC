import React from 'react';
import './ResourceCard.scss';

interface ResourceCardProps {
  type: string;
  tag: string;
  title: string;
  file?: string;
  description: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  type,
  tag,
  title,
  file,
  description,
}) => {
  return (
    <article className="resource-card">
      <div className="resource-card__pill">{type}</div>

      {file && (
        <div className="resource-card__image-wrapper">
          <img
            className="resource-card__image"
            src={file}
            alt={title}
          />
        </div>
      )}

      <div className="resource-card__body">
        <div className="resource-card__copy">
          <h2 className="resource-card__title">{title}</h2>
          <p className="resource-card__description">{description}</p>
        </div>

        <div className="resource-card__footer">
          <div className="resource-card__pill">{tag}</div>

          <div className="resource-card__link">
            <span>View details</span>
            <span className="resource-card__arrow" aria-hidden="true" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default ResourceCard;
