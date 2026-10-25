import JsonWebToken from "jsonwebtoken";
import { read, save } from "../database/connection.js";
import bcrypt from "bcrypt";
import { env } from "../env.js";

export class AuthService {
  async register(email: string, password: string) {
    const user = (await read()).users.find((u) => u.email === email);
    if (user) {
      throw new Error("Usuário já cadastrado");
    }
    const userId = Math.random().toString();

    const hash = await bcrypt.hash(password, 10);
    await save({
      id: userId,
      email,
      password: hash,
    });
  }

  async login(email: string, password: string) {
    const user = (await read()).users.find((u) => u.email === email);

    if (!user) {
      throw new Error("E-mail ou senha inválidos");
    }

    const hashCompare = await bcrypt.compare(password, user.password);

    if (!hashCompare) {
      throw new Error("E-mail ou senha inválidos");
    }

    const token = JsonWebToken.sign(
      {
        email,
      },
      env.JWT_TOKEN,
      { expiresIn: "1d" },
    );

    return token;
  }
}
