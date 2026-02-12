import { User, UserModel } from "./models";

const getUsers = async () => UserModel.find({});

const getUserById = async (id: string) => UserModel.find({ _id: id });

const updateUser = async (id: string, updatedFields: Partial<User>) =>
  UserModel.findOneAndUpdate({ _id: id }, updatedFields);   

const deleteUserById = async (id: string) => UserModel.deleteOne    ({ _id: id });

export default {
  getUsers,
  getUserById,
  updateUser,
  deleteUserById
};  