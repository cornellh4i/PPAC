"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("./models");
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () { return models_1.UserModel.find({}); });
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () { return models_1.UserModel.findOne({ _id: id }); });
const updateUser = (id, updatedFields) => __awaiter(void 0, void 0, void 0, function* () { return models_1.UserModel.findOneAndUpdate({ _id: id }, updatedFields, { new: true }); });
const deleteUserById = (id) => __awaiter(void 0, void 0, void 0, function* () { return models_1.UserModel.deleteOne({ _id: id }); });
exports.default = {
    getUsers,
    getUserById,
    updateUser,
    deleteUserById
};
