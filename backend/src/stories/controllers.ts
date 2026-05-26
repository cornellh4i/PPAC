import mongoose from "mongoose";

import { Story, StoryModel } from "./models";

const getStories = async () => StoryModel.find().sort({ createdAt: -1 });

const getStoryById = async (id: mongoose.Types.ObjectId) =>
  StoryModel.findById(id);

const insertStory = async (story: Partial<Story>) => StoryModel.create(story);

const updateStory = async (
  id: mongoose.Types.ObjectId,
  updates: Partial<Story>
) =>
  StoryModel.findByIdAndUpdate(
    id,
    {
      ...updates,
      updatedAt: new Date(),
    },
    { new: true }
  );

const deleteStory = async (id: mongoose.Types.ObjectId) =>
  StoryModel.findByIdAndDelete(id);

export default {
  getStories,
  getStoryById,
  insertStory,
  updateStory,
  deleteStory,
};
