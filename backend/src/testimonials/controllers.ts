import mongoose from "mongoose";

import { Testimonial, TestimonialModel } from "./models";

const getTestimonials = async () =>
  TestimonialModel.find().sort({ order: 1, createdAt: 1 });

const getTestimonialById = async (id: mongoose.Types.ObjectId) =>
  TestimonialModel.findById(id);

const insertTestimonial = async (testimonial: Partial<Testimonial>) =>
  TestimonialModel.create(testimonial);

const updateTestimonial = async (
  id: mongoose.Types.ObjectId,
  updates: Partial<Testimonial>
) =>
  TestimonialModel.findByIdAndUpdate(
    id,
    {
      ...updates,
      updatedAt: new Date(),
    },
    { new: true }
  );

const deleteTestimonial = async (id: mongoose.Types.ObjectId) =>
  TestimonialModel.findByIdAndDelete(id);

export default {
  getTestimonials,
  getTestimonialById,
  insertTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
