"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.User = void 0;
const typegoose_1 = require("@typegoose/typegoose");
class User {
    constructor(_id, firebaseUid, email, name, createdAt, role, profileImage, practitionerProfile) {
        this._id = _id;
        this.firebaseUid = firebaseUid;
        this.email = email;
        this.name = name;
        this.createdAt = createdAt;
        this.role = role;
        if (role === "practitioner") {
            this.practitionerProfile = {
                specialty: (practitionerProfile === null || practitionerProfile === void 0 ? void 0 : practitionerProfile.specialty) || "",
                organization: (practitionerProfile === null || practitionerProfile === void 0 ? void 0 : practitionerProfile.organization) || "",
                location: (practitionerProfile === null || practitionerProfile === void 0 ? void 0 : practitionerProfile.location) || "",
                verified: (practitionerProfile === null || practitionerProfile === void 0 ? void 0 : practitionerProfile.verified) || false
            };
        }
    }
}
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], User.prototype, "_id", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], User.prototype, "firebaseUid", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: Date.now }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], User.prototype, "profileImage", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], User.prototype, "practitionerProfile", void 0);
exports.User = User;
const UserModel = (0, typegoose_1.getModelForClass)(User);
exports.UserModel = UserModel;
