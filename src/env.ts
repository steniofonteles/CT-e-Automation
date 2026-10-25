import z from "zod";
import "dotenv/config";

z.config(z.locales.pt());
const envs = z.object({
  JWT_TOKEN: z.string(),
});

const validade = envs.safeParse(process.env);

if (!validade.success) {
  const errors = validade.error.issues.map((error) => ({
    message: "VARIÁVEL DE AMBIENTE AUSENTE NO .ENV",
    path: error.path,
  }));
  throw new Error(JSON.stringify(errors));
}

export const env = validade.data;
