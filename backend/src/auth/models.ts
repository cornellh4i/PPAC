import { getModelForClass, prop } from "@typegoose/typegoose";

class AdminEmail {
  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ default: Date.now })
  public createdAt?: Date;
}

const AdminEmailModel = getModelForClass(AdminEmail);
export { AdminEmail, AdminEmailModel };
