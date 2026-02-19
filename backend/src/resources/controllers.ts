import { Resource, ResourceModel } from "./models";
import mongoose from "mongoose";

const addResource = async (resource: Resource) => {
  const newResource = new ResourceModel(resource);
  return newResource.save();
}
const getResources = async () => ResourceModel.find({});
const getResourceById = async (id: mongoose.Types.ObjectId) => ResourceModel.findOne({ _id: id });
const updateResource = async (id: mongoose.Types.ObjectId, updatedFields: Partial<Resource>) => ResourceModel.findOneAndUpdate({ _id: id }, updatedFields);   
const deleteResourceById = async (id: mongoose.Types.ObjectId) => ResourceModel.deleteOne({ _id: id });

export default {
    addResource,
    getResources,
    getResourceById,
    updateResource,
    deleteResourceById
};  