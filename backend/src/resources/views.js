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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controllers_1 = __importDefault(require("./controllers"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonResponses_1 = require("../utils/jsonResponses");
const resourceRouter = (0, express_1.Router)();
resourceRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const queryType = req.query.type;
    const filter = {};
    if (queryType) {
        filter["type"] = queryType;
    }
    try {
        const resource = yield controllers_1.default.getResources(filter);
        res.status(200).send((0, jsonResponses_1.successJson)(resource));
    }
    catch (error) {
        res.status(400).send((0, jsonResponses_1.errorJson)("Failed to fetch resources"));
    }
}));
resourceRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = new mongoose_1.default.Types.ObjectId(req.params.id);
        const resource = yield controllers_1.default.getResourceById(id);
        if (resource) {
            res.status(200).send((0, jsonResponses_1.successJson)(resource));
        }
        else {
            res.status(404).send((0, jsonResponses_1.errorJson)("Resource not found"));
        }
    }
    catch (error) {
        res.status(400).send((0, jsonResponses_1.errorJson)("Invalid resource ID"));
    }
}));
resourceRouter.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = new mongoose_1.default.Types.ObjectId(req.params.id);
        const resource = yield controllers_1.default.getResourceById(id);
        if (!resource) {
            res.status(404).send((0, jsonResponses_1.errorJson)("Resource not found"));
            return;
        }
        const updatedResource = yield controllers_1.default.updateResource(id, req.body);
        res.status(200).send((0, jsonResponses_1.successJson)(updatedResource));
    }
    catch (error) {
        res.status(400).send((0, jsonResponses_1.errorJson)("Failed to update resource"));
    }
}));
resourceRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = new mongoose_1.default.Types.ObjectId(req.params.id);
        const resource = yield controllers_1.default.getResourceById(id);
        if (!resource) {
            res.status(404).send((0, jsonResponses_1.errorJson)("Resource not found"));
            return;
        }
        const result = yield controllers_1.default.deleteResourceById(id);
        if (result.deletedCount > 0) {
            res.status(200).send((0, jsonResponses_1.successJson)(result));
        }
        else {
            res.status(404).send((0, jsonResponses_1.errorJson)("Failure to delete resource"));
        }
    }
    catch (error) {
        res.status(400).send((0, jsonResponses_1.errorJson)("Failure to delete resource"));
    }
}));
resourceRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, type, description, link, file, createdBy } = req.body;
    if (!title || !type || !description || !link || !createdBy) {
        res.status(400).send((0, jsonResponses_1.errorJson)("Missing a required field"));
        return;
    }
    try {
        const resource = yield controllers_1.default.addResource({ title, type, description, link, file, createdBy });
        res.status(201).send((0, jsonResponses_1.successJson)(resource));
    }
    catch (error) {
        res.status(400).send((0, jsonResponses_1.errorJson)("Failed to create resource"));
    }
}));
exports.default = resourceRouter;
