import { getModelForClass, prop } from "@typegoose/typegoose";

class CommunityPhoto {
  @prop({ required: true, enum: ["hero", "scrapbook"] })
  public section!: "hero" | "scrapbook";

  @prop({ required: true })
  public imageUrl!: string;

  @prop({ required: true })
  public cloudinaryPublicId!: string;

  @prop()
  public caption?: string;

  @prop()
  public date?: string;

  @prop({ default: 0 })
  public order?: number;

  @prop({ default: Date.now })
  public createdAt?: Date;
}

const CommunityPhotoModel = getModelForClass(CommunityPhoto);
export { CommunityPhoto, CommunityPhotoModel };
