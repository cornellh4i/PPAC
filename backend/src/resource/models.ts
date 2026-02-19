import { getModelForClass, prop } from "@typegoose/typegoose";
import { ObjectId } from "mongoose";

class Resource {
    @prop({ required: true, unique: true })
    public _id!: ObjectId;

    @prop({ required: true, unique: true })
    public title!: string;

    @prop({ required: true, unique: true })
    public type!: "website" | "podcast" | "book" | "video";

    @prop({ required: true, unique: true })
    public description!: string;

    @prop({ required: true, unique: true })
    public link!: string;

    @prop({ required: true, unique: true })
    public file!: string;

    @prop({ required: true, unique: true })
    public createdBy!: ObjectId; // users._id

    @prop({ default: Date.now })
    public createdAt?: Date;
}


const ResourceModel = getModelForClass(Resource);
export { Resource, ResourceModel };