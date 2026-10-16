import axios from "axios";
import type { Request, Response } from "express";
import { egsLoginSchema } from "../DTO/egsAuth.js";
import { egsLogin } from "../service/egsAuth.js";

export class EgsAuthController {
  async login(req: Request, res: Response) {
    const validade = egsLoginSchema.safeParse(req.body);
    if (!validade.success) {
      res.status(400).json({
        message: "Campos inválidos",
        errors: validade.error.issues.map((issue) => issue.message),
      });
      return;
    }

    const { chaveAcesso, username, password } = validade.data;

    try {
      const result = await egsLogin(chaveAcesso, username, password);
      res.json(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[egs/login] falha", {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
          code: error.code,
          message: error.message,
        });
      } else {
        console.error("[egs/login] falha", error);
      }
      res.status(401).json({ message: "Falha na autenticação com o EGS" });
    }
  }
}
