import { getModelForClass, prop } from "@typegoose/typegoose";
import { ObjectId } from "mongoose";

class Location {
  @prop({ required: true })
  public type!: "in_person" | "virtual" | "hybrid";

  @prop()
  public venue?: string;

  @prop()
  public address?: string;

  @prop()
  public link?: string;
}

class Organizer {
  @prop({ required: true })
  public name!: string;

  @prop({ required: true })
  public organization!: string;

  @prop({ required: true })
  public contactEmail!: string;
}

class Event {
  @prop({ required: true })
  public title!: string;

  @prop({ required: true })
  public description!: string;

  @prop({ required: true })
  public eventType!: "ppac" | "partner" | "campus";

  @prop({ required: true })
  public startTime!: Date;

  @prop()
  public endTime?: Date;

  @prop({ default: false })
  public allDay?: boolean;

  @prop({ required: true })
  public location!: Location;

  @prop({ required: true })
  public organizer!: Organizer;

  @prop({ type: () => [String] })
  public tags?: string[];

  @prop({ required: true })
  public createdBy!: ObjectId; // users._id

  @prop({ default: Date.now })
  public createdAt?: Date;

  @prop({ default: Date.now })
  public updatedAt?: Date;

  @prop({ default: false })
  public isPublished?: boolean;

  @prop({ default: "public" })
  public visibility?: "public" | "ppac_only";
}

const EventModel = getModelForClass(Event);

export { Event, EventModel };