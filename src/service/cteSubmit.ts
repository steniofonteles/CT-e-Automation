import type z from "zod";
import { egsConnection } from "../axios.js";
import { convertToCpfCnpj } from "../utils/conversor.js";
import type { criarCteSchema } from "../DTO/cte.js";
import type { Company } from "../types/global.types.js";

type CriarCteInput = Omit<z.infer<typeof criarCteSchema>, "company" | "egstoken">;

export class CteSubmitService {
  async criarCte(company: Company, token: string, input: CriarCteInput) {
    const api = egsConnection(company, token);

    const buscarCadastro = async (cpfCnpj: string) => {
      const cpfCnpjFormatado = convertToCpfCnpj(cpfCnpj);
      const { data } = await api.post("/api/ComboBox/GCADASTRO", {
        search: cpfCnpjFormatado,
        id: null,
        propertyList: [],
      });
      return data?.[0];
    };

    const buscarVeiculo = async (placa: string) => {
      const { data } = await api.get("/odata/Gveiculo", {
        params: {
          $filter: `(contains(tolower(PLACA), '${placa.toLowerCase()}')) and (STATUS ne 'C')`,
          $count: true,
          $top: 20,
        },
      });
      return data.value?.[0];
    };

    const [remetente, destinatario, motorista, veiculo] = await Promise.all([
      buscarCadastro(input.cpfCnpjRemetente),
      buscarCadastro(input.cpfCnpjDestinatario),
      buscarCadastro(input.cpfMotorista),
      buscarVeiculo(input.placaVeiculo),
    ]);

    if (!remetente) throw new Error("Remetente não encontrado no EGS");
    if (!destinatario) throw new Error("Destinatário não encontrado no EGS");
    if (!motorista) throw new Error("Motorista não encontrado no EGS");
    if (!veiculo) throw new Error("Veículo não encontrado no EGS");

    const cte = {
      IDREMETENTE: remetente.IDCADASTRO,
      IDDESTINATARIO: destinatario.IDCADASTRO,
      IDCONTRATANTE: destinatario.IDCADASTRO,
      IDMOTORISTA: motorista.IDCADASTRO,
      IDVEICULO: veiculo.IDVEICULO,
      CODCIDADEEMISSAOCTE: remetente.CODCIDADE,
      CODCIDADEINISERV: remetente.CODCIDADE,
      NOMECIDADEINICIOSERV: remetente.NOMEMUNICIPIO,
      CODCIDADEFIMSERV: destinatario.CODCIDADE,
      NOMECIDADEFIMSERV: destinatario.NOMEMUNICIPIO,
      NOMECIDADEEMISSAO: destinatario.NOMEMUNICIPIO,
      UFINISERV: remetente.CODESTADO,
      UFFIMSERV: destinatario.CODESTADO,
      UFEMISSAOCTE: remetente.CODESTADO,
      CODUFEMPRESA: remetente.CODESTADO,
      DESCCARGA: input.produtoPredominante,
      TIPOCARGA: input.produtoPredominante,
      VALORCARGA: input.valorCarga,
      VALORSERVICO: input.valorServico,
      VALORRECEBER: input.valorServico,
      ICMS_VALORBC: input.valorServico,
      ICMS_VALORICMS: input.valorICMS,
      PESOKG: input.quantidadeCarga,
      PLACATRACAO: veiculo.PLACA,
      OBSVEICMOTVEIC: `Veiculo: ${veiculo.PLACA}\nMotorista: ${motorista.NOME}`,
      DOCNFE: input.docNFe.map((doc) => ({
        CHAVENFE: doc.chaveNotaFiscal,
        NNF: doc.numeroNotaFiscal,
      })),
      CARGAQTD: [
        {
          IDENT: 0,
          IDCTE: 0,
          UNIDADE: "01",
          QUANTIDADE: input.quantidadeCarga,
          DESCMEDIDA: "01 - KG",
          DESCUNIDADE: "KG",
        },
      ],
      MODALRODO: {
        IDENT: 0,
        IDCTE: 0,
        RNTC: veiculo.RNTC,
        DATAPREVENTREGA: "0001-01-01T00:00:00",
        INDLOTACAO: 0,
        CIOT: null,
        TAF: null,
        NROREGESTADUAL: null,
      },
      Veiculos: [
        {
          IDENT: 0,
          IDCTE: 0,
          CODVEICULO: null,
          RENAVAN: veiculo.RENAVAN,
          PLACA: veiculo.PLACA,
          TARA: veiculo.TARA,
          CAPACIDADEKG: veiculo.CAPACIDADEKG,
          CAPACIDADEM3: veiculo.CAPACIDADEM3,
          PROPRIO: veiculo.PROPRIO,
          TIPOVEICULO: veiculo.TIPOVEICULO,
          UFLICENCIADO: veiculo.UFLICENCIADO,
          RNTC: veiculo.RNTC,
          TIPOPROPRIETARIO: veiculo.TIPOPROPRIETARIO,
          IDVEICULO: veiculo.IDVEICULO,
          TIPORODADO: veiculo.TIPORODADO,
          TIPOCARROCERIA: veiculo.TIPOCARROCERIA,
          CPFCNPJ: veiculo.CPFCNPJ,
          NOMEPROPRIETARIO: veiculo.NOMEPROPRIETARIO,
          INSCESTADUAL: veiculo.INSCESTADUAL,
          UFINSCESTADUAL: veiculo.UFINSCESTADUAL,
        },
      ],
      IBSCBS: {
        vBC: input.valorServico,
        vIBSUF: input.valorIBSUF,
        vIBS: input.valorIBS,
        vCBS: input.valorCBS,
      },
    };

    try {
      const { data } = await api.post("/api/CteApi/Salvar", cte);
      return data;
    } catch (error: any) {
      const detalhe =
        typeof error.response?.data === "string"
          ? error.response.data
          : JSON.stringify(error.response?.data ?? error.message);
      throw new Error(`Erro ao enviar CT-e para o EGS: ${detalhe}`, { cause: error });
    }
  }
}
