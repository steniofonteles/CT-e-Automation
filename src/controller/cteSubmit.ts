import type { Request, Response } from "express";
import { criarCteSchema } from "../DTO/cte.js";
import type { CteSubmitService } from "../service/cteSubmit.js";

export class CteSubmitController {
  constructor(private readonly service: CteSubmitService) {}

  async criar(req: Request, res: Response) {
    const validade = criarCteSchema.safeParse(req.body);
    if (!validade.success) {
      res.status(400).json({
        message: "Campos inválidos",
        errors: validade.error.issues.map((issue) => issue.message),
      });
      return;
    }

    const { company, egstoken, ...input } = validade.data;

    try {
      const data = await this.service.criarCte(company, egstoken, input);
      res.status(201).json({ message: "CT-e enviado com sucesso", data });
    } catch (error: any) {
      res.status(500).json({ message: error.message ?? "Erro ao enviar CT-e" });
    }
  }
}
