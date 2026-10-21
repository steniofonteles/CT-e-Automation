import type { Request, Response } from "express";
import { ReaderCRLV } from "../utils/readerCRLV.js";
import { ReaderANTT } from "../utils/readerANTT.js";
import { ReaderCNH } from "../utils/readerCNH.js";

export class CteController {
  async crlv(req: Request, res: Response) {
    const file = req.file?.buffer;
    if (!file) {
      throw new Error("FILE NOT FOUND");
    }
    const text = await ReaderCRLV(file);
    console.log(text);
    res.json(text);
  }

  async antt(req: Request, res: Response) {
    const file = req.file?.buffer;
    if (!file) {
      throw new Error("FILE NOT FOUND");
    }
    const numero = await ReaderANTT(file);
    if (!numero) {
      res
        .status(422)
        .json({ message: "Número da ANTT não encontrado no PDF" });
      return;
    }
    res.json(numero);
  }

  async cnh(req: Request, res: Response) {
    const file = req.file?.buffer;
    if (!file) {
      throw new Error("FILE NOT FOUND");
    }
    const dados = await ReaderCNH(file);
    res.json(dados);
  }
}
