import type { NextFunction, Request, Response } from "express";
import jsonwebtoken from "jsonwebtoken";
import type { jwtPayload } from "../types/user.js";
import { env } from "../env.js";

export function IsLogged(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({
      statusCode: 401,
      message: "MISSING AUTHORIZATION TOKEN",
    });
    return;
  }
  const [type, token] = authorization.split(" ");
  if (type !== "Bearer" || !token) {
    res.status(401).json({
      statusCode: 401,
      message: "INVALID AUTHORIZATION TOKEN",
    });
    return;
  }

  try {
    jsonwebtoken.verify(token, env.JWT_TOKEN) as jwtPayload;
  } catch {
    res.status(401).json({
      statusCode: 401,
      message: "INVALID AUTHORIZATION TOKEN",
    });
    return;
  }
  next();
}
