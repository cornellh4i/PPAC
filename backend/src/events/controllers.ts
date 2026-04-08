import mongoose from "mongoose";

import { EventModel, Event } from "./models";

/**
 * Finds all event docs in DB
 * @returns promise with event docs or error
 */
const getEvents = async (filter?: Record<string, unknown>) => EventModel.find({});

/**
 * Finds an event doc by id
 * @param id event id
 * @returns promise with event doc or error
 */
const getEventById = async (id: mongoose.Types.ObjectId) =>
  EventModel.findById(id);

/**
 * Inserts a new event into DB
 * @param event event data
 * @returns promise with new event doc or error
 */
const insertEvent = async (event: Partial<Event>) =>
  EventModel.create(event);

/**
 * Updates an event in DB
 * @param id event id
 * @param updates fields to update
 * @returns promise with updated event doc or error
 */
const updateEvent = async (id: mongoose.Types.ObjectId, updates: Partial<Event>) =>
  EventModel.findByIdAndUpdate(id, updates, { new: true });

/**
 * Deletes an event from DB
 * @param id event id
 * @returns promise with deleted event doc or error
 */
const deleteEvent = async (id: mongoose.Types.ObjectId) =>
  EventModel.findByIdAndDelete(id);

export default {
  getEvents,
  getEventById,
  insertEvent,
  updateEvent,
  deleteEvent,
};