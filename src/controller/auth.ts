import type { Request, Response } from "express";
import { loginDTO, registerDTO } from "../DTO/auth.js";
import type { AuthService } from "../service/auth.js";

export class AuthController {
  constructor(private readonly service: AuthService) {}

  async login(req: Request, res: Response) {
    const validade = loginDTO.safeParse(req.body);

    if (validade.error) {
      res
        .json({
          statusCode: 400,
          detail: validade.error.issues.map((error) => ({
            message: error.message,
            path: error.path,
          })),
        })
        .status(400);
      return;
    }
    const { email, password } = validade.data;

    try {
      const token = await this.service.login(email, password);
      res.status(200).json({ token });
    } catch {
      res.status(401).json({ message: "INVALID EMAIL OR PASSWORD" });
    }
  }

  async register(req: Request, res: Response) {
    if (process.env.ALLOW_REGISTER !== "true") {
      res.status(403).json({ message: "REGISTRATION DISABLED" });
      return;
    }

    const validade = registerDTO.safeParse(req.body);

    if (validade.error) {
      res
        .json({
          statusCode: 400,
          detail: validade.error.issues.map((error) => ({
            message: error.message,
            path: error.path,
          })),
        })
        .status(400);
      return;
    }
    const { email, password } = validade.data;
    try {
      await this.service.register(email, password);
      res.status(201).send("SUCCESSFULLY REGISTERED");
    } catch (error: any) {
      res.status(409).json({ message: error.message });
    }
  }
}
