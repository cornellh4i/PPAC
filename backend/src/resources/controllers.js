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
const addResource = (resource) => __awaiter(void 0, void 0, void 0, function* () {
    const newResource = new models_1.ResourceModel(resource);
    return newResource.save();
});
const getResources = (filter = {}) => __awaiter(void 0, void 0, void 0, function* () { return models_1.ResourceModel.find(filter); });
const getResourceById = (id) => __awaiter(void 0, void 0, void 0, function* () { return models_1.ResourceModel.findOne({ _id: id }); });
const updateResource = (id, updatedFields) => __awaiter(void 0, void 0, void 0, function* () { return models_1.ResourceModel.findOneAndUpdate({ _id: id }, updatedFields); });
const deleteResourceById = (id) => __awaiter(void 0, void 0, void 0, function* () { return models_1.ResourceModel.deleteOne({ _id: id }); });
exports.default = {
    addResource,
    getResources,
    getResourceById,
    updateResource,
    deleteResourceById
};
