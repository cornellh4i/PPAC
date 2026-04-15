import React from 'react';
import './EventCard.scss';
import Button from '../../atoms/Button/Button';
import { ArrowRight } from 'lucide-react';

interface EventCardProps {
    title: string;
    primaryActionLabel?: string;
    secondaryActionLabel?: string;
    imageUrl?: string;
}

const EventCard: React.FC<EventCardProps> = ({
    title,
    primaryActionLabel = 'Sign up!',
    secondaryActionLabel = 'All events',
    imageUrl,
}) => {
    return (
        <div className="event-card">
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={`${title} event`}
                    className="event-card__image"
                />
            ) : (
                <div className="event-card__image-fallback" aria-hidden="true" />
            )}

            <div className="event-card__content">
                <h2 className="event-card__title">{title}</h2>
                <div className="event-card__actions">
                    <Button variant="sub">{primaryActionLabel}</Button>
                    <Button variant="sub">
                        <span className="event-card__all-events">{secondaryActionLabel}</span>
                        <span className="event-card__arrow" aria-hidden="true">
                            <ArrowRight size={14} strokeWidth={3} />
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;