import { getModelForClass, prop } from "@typegoose/typegoose";

class AvailabilitySlot {
  @prop({ required: true })
  public day!: string;

  @prop({ required: true })
  public time!: string;
}

class Provider {
  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ required: true, trim: true })
  public field!: string;

  @prop({ required: true, trim: true })
  public location!: string;

  @prop()
  public rating?: number;

  @prop({ type: () => [AvailabilitySlot], default: [] })
  public availability!: AvailabilitySlot[];

  @prop({ type: () => [String], default: [] })
  public insurance!: string[];

  @prop({ required: true, trim: true })
  public number!: string;

  @prop({ required: true })
  public about!: string;

  @prop({ required: true })
  public experience!: string;

  @prop({ enum: ["female", "male"] })
  public avatar?: "female" | "male";

  @prop({ required: true, trim: true })
  public bookingLink!: string;

  @prop({ default: 0 })
  public order?: number;

  @prop({ default: Date.now })
  public createdAt?: Date;
}

const ProviderModel = getModelForClass(Provider);
export { Provider, AvailabilitySlot, ProviderModel };
