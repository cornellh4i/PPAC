import { Provider, ProviderModel } from "./models";
import mongoose from "mongoose";

const addProvider = async (provider: Provider) => {
  const newProvider = new ProviderModel(provider);
  return newProvider.save();
};

const getProviders = async () => ProviderModel.find().sort({ order: 1, createdAt: 1 });

const getProviderById = async (id: mongoose.Types.ObjectId) =>
  ProviderModel.findOne({ _id: id });

const updateProvider = async (id: mongoose.Types.ObjectId, updatedFields: Partial<Provider>) =>
  ProviderModel.findOneAndUpdate({ _id: id }, updatedFields, { new: true });

const deleteProviderById = async (id: mongoose.Types.ObjectId) =>
  ProviderModel.deleteOne({ _id: id });

export default {
  addProvider,
  getProviders,
  getProviderById,
  updateProvider,
  deleteProviderById,
};
