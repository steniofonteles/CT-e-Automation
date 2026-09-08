import { PDFParse } from "pdf-parse";
import { createWorker, type Worker } from "tesseract.js";

export interface CnhData {
  nome?: string;
  cpf?: string;
}

let workerPromise: Promise<Worker> | undefined;

function getWorker() {
  workerPromise ??= createWorker("por");
  return workerPromise;
}

function extractCpf(text: string): string | undefined {
  const direct = text.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/)?.[0];
  if (direct) return direct;

  const normalized = text.replace(/[Oo]/g, "0").replace(/[IlI]/g, "1");
  return normalized.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/)?.[0];
}

function extractNome(text: string): string | undefined {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const labelIndex = lines.findIndex((l) => /NO[MV]E/i.test(l));
  if (labelIndex === -1) return undefined;

  const nameLine = lines[labelIndex + 1];
  if (!nameLine) return undefined;

  const match = nameLine.match(/^([A-ZÀ-ÚÇ][A-ZÀ-ÚÇ\s]{4,60}?)(?:\s+\d|\s*$)/);
  return match?.[1]?.trim();
}

export async function ReaderCNH(file: Buffer): Promise<CnhData> {
  const parser = new PDFParse({ data: file });

  try {
    const { pages } = await parser.getImage({ imageBuffer: true });
    const images = (pages[0]?.images ?? []).filter(
      (img) => img.kind === 2 && img.width >= 300 && img.data,
    );

    const worker = await getWorker();
    const result: CnhData = {};

    for (const img of images) {
      const { data } = await worker.recognize(Buffer.from(img.data!));

      const cpf = extractCpf(data.text);
      if (cpf) result.cpf ??= cpf;

      const nome = extractNome(data.text);
      if (nome) result.nome ??= nome;

      if (result.cpf && result.nome) break;
    }

    return result;
  } finally {
    await parser.destroy();
  }
}
