import { getModelForClass, prop } from "@typegoose/typegoose";
import { Types } from "mongoose";

class Conversation {
    @prop({ required: true })
    public studentId!: Types.ObjectId;

    @prop({ required: true })
    public practitionerId!: Types.ObjectId;

    @prop({ default: Date.now })
    public createdAt?: Date;
}


const ConversationModel = getModelForClass(Conversation);
export { Conversation, ConversationModel };
