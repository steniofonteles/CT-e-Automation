import cors from "cors";
import express, { type Request, type Response } from "express";
import { AuthController } from "./controller/auth.js";
import { IsLogged } from "./middleware/isLogged.js";
import "./env.js";
import { AuthService } from "./service/auth.js";
import { CompanyController } from "./controller/company.js";
import multer from "multer";
import { CteController } from "./controller/files.js";

const authService = new AuthService();
const authRoutes = new AuthController(authService);
const company = new CompanyController();
const cte = new CteController();
const upload = multer({ storage: multer.memoryStorage() });

const app = express();

app.use(cors());
app.use(express.json());

app.post("/register", (req, res) => authRoutes.register(req, res));
app.post("/login", (req, res) => authRoutes.login(req, res));

app.get(
  "/admin",
  IsLogged,
  async (req, res) => await company.getCurrentCompany(req, res),
);

app.post(
  "/admin/crlv",
  upload.single("file"),
  IsLogged,
  async (req, res) => await cte.crlv(req, res),
);

app.post(
  "/admin/antt",
  upload.single("file"),
  IsLogged,
  async (req, res) => await cte.antt(req, res),
);

app.post(
  "/admin/cnh",
  upload.single("file"),
  IsLogged,
  async (req, res) => await cte.cnh(req, res),
);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`system running in port ${PORT}`);
});
