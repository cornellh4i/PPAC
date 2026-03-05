import { getModelForClass, prop } from "@typegoose/typegoose";
import { ObjectId } from "mongoose";

class Resource {
    @prop({ required: true, unique: true })
    public title!: string;

    @prop({ required: true })
    public type!: "website" | "podcast" | "book" | "video";

    @prop({ required: true })
    public description!: string;

    @prop({ required: true })
    public link!: string;

    @prop()
    public file?: string;

    @prop({ required: true })
    public createdBy!: ObjectId; // users._id

    @prop({ default: Date.now })
    public createdAt?: Date;
}


const ResourceModel = getModelForClass(Resource);
export { Resource, ResourceModel };
