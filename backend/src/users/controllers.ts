import { User, UserModel } from "./models";
import mongoose from "mongoose";

const getUsers = async () => UserModel.find({});

const getUserById = async (id: mongoose.Types.ObjectId) => UserModel.find({ _id: id });

const updateUser = async (id: string, updatedFields: Partial<User>) =>
  UserModel.findOneAndUpdate({ _id: id }, updatedFields);   

const deleteUserById = async (id: mongoose.Types.ObjectId) =>
  UserModel.deleteOne({ _id: id });

export default {
  getUsers,
  getUserById,
  updateUser,
  deleteUserById
};  