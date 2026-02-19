import { Resource, ResourceModel } from "./models";

const addResource = async (resource: Resource) => {
  const newResource = new ResourceModel(resource);
  return newResource.save();
}
const getResources = async () => ResourceModel.find({});
const getResourceById = async (id: string) => ResourceModel.findOne({ _id: id });
const updateResource = async (id: string, updatedFields: Partial<Resource>) => ResourceModel.findOneAndUpdate({ _id: id }, updatedFields);   
const deleteResourceById = async (id: string) => ResourceModel.deleteOne({ _id: id });

export default {
    addResource,
    getResources,
    getResourceById,
    updateResource,
    deleteResourceById
};  