import { PDFParse } from "pdf-parse";

// O certificado da ANTT chega em dois formatos: PDFs salvos pelo navegador, que
// trazem o número no título ("Certificado_049675499.pdf"), e PDFs oficiais
// (Telerik), sem título, onde o número aparece no texto ("ETC 048424585").
function numeroDoTitulo(title: string): string | undefined {
  return title.match(/(\d+)/)?.[1];
}

function numeroDoTexto(text: string): string | undefined {
  return (
    text.match(/\b(?:ETC|TAC|CTC)\s*(\d{8,10})\b/i)?.[1] ??
    text.match(/RNTRC\D{0,20}(\d{8,10})\b/i)?.[1]
  );
}

export async function ReaderANTT(file: Buffer): Promise<string | undefined> {
  const parser = new PDFParse({ data: file });

  try {
    const { info } = await parser.getInfo();
    let numero = numeroDoTitulo(info?.Title ?? "");

    if (!numero) {
      const { text } = await parser.getText();
      numero = numeroDoTexto(text);
    }

    if (!numero) return undefined;

    // Remove apenas o primeiro zero à esquerda (ex.: 049675499 -> 49675499).
    return numero.replace(/^0/, "");
  } finally {
    await parser.destroy();
  }
}
