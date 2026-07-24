import { getModelForClass, prop } from "@typegoose/typegoose";

export class PresidentsLetter {
  @prop({ required: true, type: () => [String], default: [] })
  public paragraphs!: string[];

  @prop({ default: "Sincerely," })
  public closing?: string;

  @prop({ default: "PPAC Eboard" })
  public signature?: string;

  @prop({ default: Date.now })
  public updatedAt!: Date;
}

export const PresidentsLetterModel = getModelForClass(PresidentsLetter);
