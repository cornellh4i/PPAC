import React from 'react';
import './EventCard.scss';

interface EventCardProps {
    name: string;
    date: string;
    description: string;
    image: string;
    location: string;
}

const EventCard: React.FC<EventCardProps> = ({
    name,
    date,
    description,
    image,
    location,
}) => {
    return (
        <div className="event-card">
            <img 
                src={image} 
                alt={name} 
                className="event-card__image"
            />

            <div className="event-card__content">
                <h2 className="event-card__name">{name}</h2>
                <p className="event-card__date">{date}</p>
                <p className="event-card__location">{location}</p>
                <p className="event-card__description">{description}</p>
            </div>
        </div>
    );
};

export default EventCard;