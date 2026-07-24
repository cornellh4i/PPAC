import { TeamMember, TeamMemberModel } from "./models";
import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";
import mongoose from "mongoose";

const CLOUDINARY_FOLDER = "ppac/team-members";

const uploadImageBuffer = (buffer: Buffer): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_FOLDER },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const deleteImage = (publicId: string) => cloudinary.uploader.destroy(publicId);

const addTeamMember = async (member: TeamMember) => {
  const newMember = new TeamMemberModel(member);
  return newMember.save();
};

const getTeamMembers = async (filter: Partial<Pick<TeamMember, "category">> = {}) =>
  TeamMemberModel.find(filter).sort({ order: 1, createdAt: 1 });

const getTeamMemberById = async (id: mongoose.Types.ObjectId) =>
  TeamMemberModel.findOne({ _id: id });

const updateTeamMember = async (id: mongoose.Types.ObjectId, updatedFields: Partial<TeamMember>) =>
  TeamMemberModel.findOneAndUpdate({ _id: id }, updatedFields, { new: true });

const deleteTeamMemberById = async (id: mongoose.Types.ObjectId) =>
  TeamMemberModel.deleteOne({ _id: id });

export default {
  uploadImageBuffer,
  deleteImage,
  addTeamMember,
  getTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMemberById,
};
