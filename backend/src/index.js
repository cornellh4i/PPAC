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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const views_1 = __importDefault(require("./users/views"));
const views_2 = __importDefault(require("./auth/views"));
const views_3 = __importDefault(require("./resources/views"));
const views_4 = __importDefault(require("./events/views"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const api_spec_json_1 = __importDefault(require("../api-spec.json"));
const database_1 = require("./database");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true // If you're using cookies/auth
}));
// Middleware to parse json request bodies
app.use(body_parser_1.default.json());
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(api_spec_json_1.default));
const apiRouter = express_1.default.Router();
/**
 * Sub-routers for our main router, we should have one sub-router per "entity" in the application
 */
apiRouter.use("/users", views_1.default);
apiRouter.use("/auth", views_2.default);
apiRouter.use("/resources", views_3.default);
apiRouter.use("/events", views_4.default);
app.use("/api", apiRouter);
/**
 * Some dummy routes to illustrate express syntax
 */
app.get("/", function (req, res) {
    res.send("Hello World!");
});
app.post("/", (req, res) => {
    res.send(req.body);
});
app.listen(process.env.PORT || 8000, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("✅ Server is up and running");
    try {
        yield (0, database_1.dbConnect)();
        console.log("MongoDB connection state:", mongoose_1.default.connection.readyState); // Should be 1
    }
    catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}));
