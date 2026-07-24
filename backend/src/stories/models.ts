import { getModelForClass, prop } from "@typegoose/typegoose";

export class Story {
  @prop({ required: true, trim: true })
  public story!: string;

  @prop({
    default: null,
    trim: true,
    maxlength: 100,
  })
  public name?: string | null;

  @prop({ required: true, default: false })
  public isAnonymous!: boolean;

  @prop({ required: true, enum: ["pending", "published"], default: "pending" })
  public status!: "pending" | "published";

  @prop({ default: Date.now })
  public createdAt!: Date;

  @prop({ default: Date.now })
  public updatedAt!: Date;
}

export const StoryModel = getModelForClass(Story);
