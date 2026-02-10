import { getModelForClass, prop } from "@typegoose/typegoose";

class User {
    @prop({ required: true, unique: true })
    public firebaseUid!: string;

    @prop({ required: true, unique: true })
    public email!: string;

    @prop()
    public name?: string;

    @prop({ default: Date.now })
    public createdAt?: Date;
}


const UserModel = getModelForClass(User);
export { User, UserModel };
