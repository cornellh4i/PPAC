import { getModelForClass, prop } from "@typegoose/typegoose";

export class FaqItem {
  @prop({ required: true, trim: true })
  public question!: string;

  @prop({ required: true, trim: true })
  public answer!: string;

  @prop({ default: 0 })
  public order!: number;

  @prop({ default: Date.now })
  public createdAt!: Date;

  @prop({ default: Date.now })
  public updatedAt!: Date;
}

export const FaqItemModel = getModelForClass(FaqItem);
