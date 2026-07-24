import { getModelForClass, prop } from "@typegoose/typegoose";
import { ObjectId } from "mongoose";

class BookLink {
  @prop({ required: true })
  public label!: string;

  @prop({ required: true })
  public url!: string;
}

class Resource {
  @prop({ required: true, unique: true })
  public title!: string;

  @prop({ required: true })
  public type!: "website" | "podcast" | "book" | "local resource" | "informational";

  @prop({ required: true })
  public description!: string;

  @prop({ default: '' })
  public link!: string;

  @prop()
  public file?: string;

  @prop({ type: () => [String], default: [] })
  public tags!: string[];

  @prop({ type: () => [BookLink], default: [] })
  public readAt!: BookLink[];

  @prop({ type: () => [BookLink], default: [] })
  public borrowAt!: BookLink[];

  @prop({ required: true })
  public createdBy!: ObjectId;

  @prop({ enum: ['published', 'draft'], default: 'published' })
  public status!: 'published' | 'draft';

  @prop({ default: Date.now })
  public createdAt?: Date;
}

const ResourceModel = getModelForClass(Resource);
export { Resource, ResourceModel };