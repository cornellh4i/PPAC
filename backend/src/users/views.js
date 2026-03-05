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
const userRouter = (0, express_1.Router)();
userRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).send(yield controllers_1.default.getUsers());
    }
    catch (error) {
        res.status(400).send((0, jsonResponses_1.errorJson)("Failed to fetch users"));
    }
}));
userRouter.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = new mongoose_1.default.Types.ObjectId(req.params.id);
        const user = yield controllers_1.default.getUserById(id);
        if (user) {
            res.status(200).send((0, jsonResponses_1.successJson)(user));
        }
        else {
            res.status(404).send((0, jsonResponses_1.errorJson)("User not found"));
        }
    }
    catch (error) {
        res.status(400).send((0, jsonResponses_1.errorJson)("Invalid user ID"));
    }
}));
userRouter.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = new mongoose_1.default.Types.ObjectId(req.params.id);
        const user = yield controllers_1.default.getUserById(id);
        if (!user) {
            res.status(404).send((0, jsonResponses_1.errorJson)("User not found"));
            return;
        }
        const updatedUser = yield controllers_1.default.updateUser(id, req.body);
        res.status(200).send((0, jsonResponses_1.successJson)(updatedUser));
    }
    catch (error) {
        res.status(400).send((0, jsonResponses_1.errorJson)("Failed to update user"));
    }
}));
userRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = new mongoose_1.default.Types.ObjectId(req.params.id);
        const user = yield controllers_1.default.getUserById(id);
        if (!user) {
            res.status(404).send((0, jsonResponses_1.errorJson)("User not found"));
            return;
        }
        const result = yield controllers_1.default.deleteUserById(id);
        if (result.deletedCount > 0) {
            res.status(200).send((0, jsonResponses_1.successJson)(result));
        }
        else {
            res.status(404).send((0, jsonResponses_1.errorJson)("Failure to delete user"));
        }
    }
    catch (error) {
        res.status(400).send((0, jsonResponses_1.errorJson)(error));
    }
}));
exports.default = userRouter;
