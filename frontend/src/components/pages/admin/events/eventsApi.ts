const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export type EventType = "ppac" | "partner" | "campus";
export type LocationType = "in_person" | "virtual" | "hybrid";
export type Visibility = "public" | "ppac_only";

export interface AdminEvent {
  _id: string;
  title: string;
  description: string;
  eventType: EventType;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location: {
    type: LocationType;
    venue: string;
    address?: string | null;
    link?: string | null;
  };
  organizer: {
    name: string;
    organization: string;
    contactEmail: string;
  };
  tags: string[];
  isPublished: boolean;
  visibility: Visibility;
  createdAt?: string;
  updatedAt?: string;
}

export type EventFormValues = Omit<
  AdminEvent,
  "_id" | "createdAt" | "updatedAt"
>;

export const getEvents = async (): Promise<AdminEvent[]> => {
  const response = await fetch(`${API_URL}/api/events`);
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Failed to fetch events");
  return json.data ?? [];
};

export const createEvent = async (
  token: string,
  payload: EventFormValues,
): Promise<AdminEvent> => {
  const response = await fetch(`${API_URL}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Failed to create event");
  return json.data;
};

export const updateEvent = async (
  token: string,
  id: string,
  payload: Partial<EventFormValues>,
): Promise<AdminEvent> => {
  const response = await fetch(`${API_URL}/api/events/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Failed to update event");
  return json.data;
};

export const deleteEvent = async (token: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/events/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new Error(json.error || "Failed to delete event");
  }
};
