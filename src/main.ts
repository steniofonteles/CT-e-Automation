import cors from "cors";
import express, { type Request, type Response } from "express";
import { AuthController } from "./controller/auth.js";
import { IsLogged } from "./middleware/isLogged.js";
import "./env.js";
import { AuthService } from "./service/auth.js";
import { CompanyController } from "./controller/company.js";
import multer from "multer";
import { CteController } from "./controller/files.js";
import { DriverController } from "./controller/driver.js";
import { DriverService } from "./service/driver.js";
import { TruckController } from "./controller/truck.js";
import { TruckService } from "./service/truck.js";
import { EgsAuthController } from "./controller/egsAuth.js";
import { CteSubmitController } from "./controller/cteSubmit.js";
import { CteSubmitService } from "./service/cteSubmit.js";

const authService = new AuthService();
const egsAuth = new EgsAuthController();
const cteSubmitService = new CteSubmitService();
const cteSubmit = new CteSubmitController(cteSubmitService);
const authRoutes = new AuthController(authService);
const company = new CompanyController();
const cte = new CteController();
const driverService = new DriverService();
const driver = new DriverController(driverService);
const truckService = new TruckService();
const truck = new TruckController(truckService);
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

app.post(
  "/admin/xml",
  upload.single("file"),
  IsLogged,
  async (req, res) => await cte.xml(req, res),
);

app.post(
  "/admin/user",
  IsLogged,
  async (req, res) => await driver.registerDriver(req, res),
);

app.get(
  "/admin/user/exist",
  IsLogged,
  async (req, res) => await driver.findDriver(req, res),
);

app.get(
  "/admin/truck/exist",
  IsLogged,
  async (req, res) => await truck.findTruck(req, res),
);

app.post(
  "/admin/truck",
  IsLogged,
  async (req, res) => await truck.create(req, res),
);

app.post(
  "/egs/login",
  IsLogged,
  async (req, res) => await egsAuth.login(req, res),
);

app.post(
  "/admin/cte",
  IsLogged,
  async (req, res) => await cteSubmit.criar(req, res),
);

app.listen(3000, () => {
  console.log("system running in port http://localhost:3000");
});
