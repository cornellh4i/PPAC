import mongoose from "mongoose";

import { FaqItem, FaqItemModel } from "./models";

const getFaqItems = async () => FaqItemModel.find().sort({ order: 1, createdAt: 1 });

const getFaqItemById = async (id: mongoose.Types.ObjectId) => FaqItemModel.findById(id);

const insertFaqItem = async (faqItem: Partial<FaqItem>) => FaqItemModel.create(faqItem);

const updateFaqItem = async (
  id: mongoose.Types.ObjectId,
  updates: Partial<FaqItem>
) =>
  FaqItemModel.findByIdAndUpdate(
    id,
    {
      ...updates,
      updatedAt: new Date(),
    },
    { new: true }
  );

const deleteFaqItem = async (id: mongoose.Types.ObjectId) =>
  FaqItemModel.findByIdAndDelete(id);

export default {
  getFaqItems,
  getFaqItemById,
  insertFaqItem,
  updateFaqItem,
  deleteFaqItem,
};
