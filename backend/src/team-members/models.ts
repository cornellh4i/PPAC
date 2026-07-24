import { getModelForClass, prop } from "@typegoose/typegoose";

class TeamMember {
  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ required: true, trim: true })
  public role!: string;

  @prop({ required: true, enum: ["officer", "speaker"] })
  public category!: "officer" | "speaker";

  @prop()
  public imageUrl?: string;

  @prop()
  public cloudinaryPublicId?: string;

  @prop()
  public linkedinUrl?: string;

  @prop({ default: 0 })
  public order?: number;

  @prop({ default: Date.now })
  public createdAt?: Date;
}

const TeamMemberModel = getModelForClass(TeamMember);
export { TeamMember, TeamMemberModel };
