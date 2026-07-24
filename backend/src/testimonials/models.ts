import { getModelForClass, prop } from "@typegoose/typegoose";

export class Testimonial {
  @prop({ required: true, trim: true })
  public quote!: string;

  @prop({ required: true, trim: true })
  public author!: string;

  @prop({ default: 0 })
  public order!: number;

  @prop({ default: Date.now })
  public createdAt!: Date;

  @prop({ default: Date.now })
  public updatedAt!: Date;
}

export const TestimonialModel = getModelForClass(Testimonial);
