import z from "zod";

export const criarCteSchema = z.object({
  company: z.enum(["GADELOG", "INTERMEDIUM"], { message: "Invalid company" }),
  egstoken: z.string().min(1, { message: "Token is required" }),
  cpfCnpjRemetente: z.string().min(1, { message: "CPF/CNPJ do remetente é obrigatório" }),
  cpfCnpjDestinatario: z.string().min(1, { message: "CPF/CNPJ do destinatário é obrigatório" }),
  cpfMotorista: z.string().min(1, { message: "CPF do motorista é obrigatório" }),
  placaVeiculo: z.string().min(1, { message: "Placa do veículo é obrigatória" }),
  produtoPredominante: z.string().min(1, { message: "Produto predominante é obrigatório" }),
  valorCarga: z.number(),
  quantidadeCarga: z.number(),
  valorServico: z.number(),
  valorICMS: z.number(),
  valorIBS: z.number().default(0),
  valorCBS: z.number().default(0),
  valorIBSUF: z.number().default(0),
  docNFe: z
    .array(
      z.object({
        numeroNotaFiscal: z.string(),
        chaveNotaFiscal: z.string(),
      }),
    )
    .min(1, { message: "Pelo menos uma nota fiscal é necessária" }),
});
