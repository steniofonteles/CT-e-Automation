import type { NextFunction, Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import type { jwtPayload } from "../types/user.js";
import { env } from "../env.js";

export function IsLogged(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({
      statusCode: 401,
      message: "Token de acesso não informado. Faça login novamente.",
    });
    return;
  }
  const [type, token] = authorization.split(" ");
  if (type !== "Bearer" || !token) {
    res.status(401).json({
      statusCode: 401,
      message: "Sessão inválida ou expirada. Faça login novamente.",
    });
    return;
  }

  try {
    jsonwebtoken.verify(token, env.JWT_TOKEN) as jwtPayload;
  } catch {
    res.status(401).json({
      statusCode: 401,
      message: "Sessão inválida ou expirada. Faça login novamente.",
    });
    return;
  }
  next();
}
