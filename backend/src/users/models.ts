import { getModelForClass, prop } from "@typegoose/typegoose";
import { ObjectId } from "mongoose";

class User {
    constructor(_id: ObjectId, firebaseUid: string, email: string, name: string, createdAt: Date, role: ("student" | "practitioner" | "admin"), profileImage: string, practitionerProfile?: {specialty: string, organization: string, location: string, verified: boolean}) {
    this._id = _id;
    this.firebaseUid = firebaseUid;
    this.email = email;
    this.name = name;
    this.createdAt = createdAt;
    this.role = role;
    if (role === "practitioner") {
        this.practitionerProfile = {
            specialty: practitionerProfile?.specialty || "",
            organization: practitionerProfile?.organization || "",
            location: practitionerProfile?.location || "",
            verified: practitionerProfile?.verified || false
        };
    }

  }

    @prop()
    public _id!: ObjectId;

    @prop({ required: true, unique: true })
    public firebaseUid!: string;

    @prop({ required: true, unique: true })
    public email!: string;

    @prop()
    public name?: string;

    @prop({ default: Date.now })
    public createdAt?: Date;

    @prop()
    public role!: "student" | "practitioner" | "admin";

    @prop()
    public profileImage?: string;

    @prop()
    public practitionerProfile?: {
        specialty: string;
        organization: string;
        location: string;
        verified: boolean;
    };
}


const UserModel = getModelForClass(User);
export { User, UserModel };
