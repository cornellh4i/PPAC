import { getModelForClass, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";

class EventLocation {
  @prop({ required: true, enum: ["in_person", "virtual", "hybrid"] })
  public type!: "in_person" | "virtual" | "hybrid";

  @prop({ required: true })
  public venue!: string;

  @prop({ default: null })
  public address?: string | null;

  @prop({ default: null })
  public link?: string | null;
}

class EventOrganizer {
  @prop({ required: true })
  public name!: string;

  @prop({ required: true })
  public organization!: string;

  @prop({ required: true })
  public contactEmail!: string;
}

export class Event {
  @prop({ required: true })
  public title!: string;

  @prop({ default: "" })
  public description!: string;

  @prop({ required: true, enum: ["ppac", "partner", "campus"] })
  public eventType!: "ppac" | "partner" | "campus";

  @prop({ required: true })
  public startTime!: Date;

  @prop({ required: true })
  public endTime!: Date;

  @prop({ default: false })
  public allDay!: boolean;

  @prop({ required: true })
  public location!: EventLocation;

  @prop({ required: true })
  public organizer!: EventOrganizer;

  @prop({ type: () => [String], default: [] })
  public tags!: string[];

  @prop({ required: true, type: mongoose.Types.ObjectId })
  public createdBy!: mongoose.Types.ObjectId;

  @prop({ default: Date.now })
  public createdAt!: Date;

  @prop({ default: Date.now })
  public updatedAt!: Date;

  @prop({ default: false })
  public isPublished!: boolean;

  @prop({ default: "public", enum: ["public", "ppac_only"] })
  public visibility!: "public" | "ppac_only";
}

export const EventModel = getModelForClass(Event);
