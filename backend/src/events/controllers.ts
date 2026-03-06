import { EventModel } from "./models";
import mongoose from "mongoose";

const addEvent = async (event: object) => {
  return EventModel.create(event);
};

const getEvents = async (filter: object = {}) => {
  return EventModel.find(filter).sort({ startTime: 1 });
};

const getEventById = async (id: mongoose.Types.ObjectId) => EventModel.findById(id);

const updateEvent = async (id: mongoose.Types.ObjectId, updates: object) => {
  return EventModel.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true });
};

const deleteEvent = async (id: mongoose.Types.ObjectId) => EventModel.findByIdAndDelete(id);

export default { addEvent, getEvents, getEventById, updateEvent, deleteEvent };
