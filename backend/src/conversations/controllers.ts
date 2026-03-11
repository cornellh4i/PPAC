import mongoose from "mongoose";

import { ConversationModel, Conversation } from "./models";

/**
 * Finds all conversation docs in DB
 * @returns promise with all conversation docs or error
 */
const getConversations = async () => ConversationModel.find({});

/**
 * Finds a conversation doc by id
 * @param id conversation id
 * @returns promise with conversation doc or error
 */
const getConversationById = async (id: mongoose.Types.ObjectId) =>
  ConversationModel.findById(id);

/**
 * Finds a conversation docs by studentId
 * @param studentId student id
 * @returns promise with conversation docs or error
 */
const getConversationByStudentId = async (studentId: mongoose.Types.ObjectId) =>
  ConversationModel.find({studentId: studentId});

/**
 * Finds a conversation docs by practitionerId
 * @param practitionerId practitioner id
 * @returns promise with conversation docs or error
 */
const getConversationByPractitionerId = async (practitionerId: mongoose.Types.ObjectId) =>
  ConversationModel.find({practitionerId: practitionerId});

/**
 * Inserts a new conversation into DB
 * @param studentId student user id
 * @param practitionerId practitioner user id
 * @returns promise with new conversation doc or error
 */
const insertConversation = async (
  studentId: mongoose.Types.ObjectId,
  practitionerId: mongoose.Types.ObjectId
) =>
  ConversationModel.create(
    { studentId, practitionerId }
  );

/**
 * Deletes a conversation from DB
 * @param id conversation id
 * @returns promise with deleted conversation doc or error
 */
const deleteConversation = async (id: mongoose.Types.ObjectId) =>
  ConversationModel.findByIdAndDelete(id);


export default {
  getConversations,
  getConversationById,
  getConversationByStudentId,
  getConversationByPractitionerId,
  insertConversation,
  deleteConversation
};
