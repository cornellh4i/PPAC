import { CommunityPhoto, CommunityPhotoModel } from "./models";
import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";
import mongoose from "mongoose";

const CLOUDINARY_FOLDER = "ppac/community";

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

const addCommunityPhoto = async (photo: CommunityPhoto) => {
  const newPhoto = new CommunityPhotoModel(photo);
  return newPhoto.save();
};

const getCommunityPhotos = async (filter: Partial<Pick<CommunityPhoto, "section">> = {}) =>
  CommunityPhotoModel.find(filter).sort({ order: 1, createdAt: 1 });

const getCommunityPhotoById = async (id: mongoose.Types.ObjectId) =>
  CommunityPhotoModel.findOne({ _id: id });

const updateCommunityPhoto = async (id: mongoose.Types.ObjectId, updatedFields: Partial<CommunityPhoto>) =>
  CommunityPhotoModel.findOneAndUpdate({ _id: id }, updatedFields, { new: true });

const deleteCommunityPhotoById = async (id: mongoose.Types.ObjectId) =>
  CommunityPhotoModel.deleteOne({ _id: id });

export default {
  uploadImageBuffer,
  deleteImage,
  addCommunityPhoto,
  getCommunityPhotos,
  getCommunityPhotoById,
  updateCommunityPhoto,
  deleteCommunityPhotoById,
};
