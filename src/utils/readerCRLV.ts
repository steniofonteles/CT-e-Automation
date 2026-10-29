import { PDFParse } from "pdf-parse";

function extractPeso(texto: string): string {
  // Linha "POTÊNCIA/CILINDRADA  PESO BRUTO TOTAL", ex.: "440CV/**** 23.0" ou
  // "218CV/8270 23.0" (peso em toneladas).
  const pbt = texto.match(/\d+CV\/(?:\*+|\d+)[ \t]+(\d+(?:\.\d+)?)[ \t]*$/im)?.[1];

  if (pbt) {
    return String(Math.round(Number(pbt) * 1000));
  }

  const peso = texto.split("/****")[1]?.trim().split("\n")[0];

  if (peso) {
    return (Number(peso) * 1000).toString();
  }

  const linhas2 = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const idxPotencia = linhas2.findIndex((l) => /\d+CV\/\d+/i.test(l));

  if (idxPotencia !== -1) {
    const pesoFallback = linhas2[idxPotencia + 1];

    if (!pesoFallback) {
      return "";
    }

    if (/^\d+(\.\d+)?$/.test(pesoFallback)) {
      return String(Number(pesoFallback) * 1000);
    }
  }

  return "";
}

function extractCapacidade(texto: string): string {
  const capacidade = texto.split('ALUGUEL')[1]?.trim().split('\n')[0];
  if(capacidade === "*.*"){
    return capacidade
  }
  return capacidade ? (Number(capacidade) * 1000).toFixed(2).toString() : '';
}

export async function ReaderCRLV(buffer: Buffer) {
  const reader = new PDFParse({ data: buffer });
  const text = await reader.getText();
  const textWithSplit = text.text;
  if (!textWithSplit) return;

  const TIPOS_CARROCERIA = [
    "CARROCERIA ABERTA",
    "CABINE ESTENDIDA",
    "CARROCERIA FECHADA",
    "BASCULANTE",
    "DOLLY",
    "NãO APLICAVEL",
  ];

  const regexs = [
    { name: "renavam", pattern: /^\d{11}$/m },
    // Aceita o padrão antigo (ABC1234) e o Mercosul (ABC1D23).
    { name: "placa", pattern: /\b[A-Z]{3}\d[A-Z0-9]\d{2}\b/ },
    {
      name: "cpfCnpj",
      pattern: /\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/,
    },
    {
      name: "local",
      pattern:
        /\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/,
    },
  ] as { name: string; pattern: RegExp }[];

  const eixosRegex = / (\d) /;
  const eixos = textWithSplit.match(eixosRegex)?.[1];

  const modelo = textWithSplit
    .split("\n")
    .map((l) => l.trim())
    .find(
      (l) =>
        /^[A-Z0-9.\s]+\/[A-Z0-9]/i.test(l) && /[A-Z]/i.test(l) && l.length > 5,
    );

  let carroceria;
  TIPOS_CARROCERIA.map((tipo, i) => {
    if (textWithSplit.includes(tipo)) {
      return (carroceria = tipo);
    }
  });

  const datas = regexs.map(({ name, pattern }) => ({
    campo: name,
    valor: pattern.exec(textWithSplit)?.[0],
  }));

  // A UF correta vem na linha "CIDADE UF DD/MM/AAAA" (local e data de emissão);
  // procurar qualquer sigla solta no texto pega falsos positivos como "ES".
  const ufEmissao = textWithSplit.match(
    /\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\s+\d{2}\/\d{2}\/\d{4}/,
  )?.[1];
  const local = datas.find((data) => data.campo === "local");
  if (ufEmissao && local) {
    local.valor = ufEmissao;
  }

  if (carroceria) {
    datas.push({ campo: "Carroceria", valor: carroceria });
  }

  if (eixos) {
    datas.push({ campo: "Eixos", valor: eixos });
  }

  if (modelo) {
    datas.push({ campo: "Modelo", valor: modelo });
  }
  const cpfCnpj = datas.find((data) => data.campo === "cpfCnpj");

  if (carroceria && cpfCnpj?.valor) {
    const dono = textWithSplit
      .split(carroceria)[1]
      ?.split(cpfCnpj.valor)[0]
      ?.replaceAll("\n", "");

    if (dono) {
      datas.push({ campo: "Dono", valor: dono });
    }
  }
  const peso = extractPeso(textWithSplit);
  if (peso) {
    datas.push({ campo: "Peso", valor: peso });
  }

  const capacidade = extractCapacidade(textWithSplit)
  if(capacidade){
    datas.push({campo:"Capacidade", valor:capacidade})
  }

  return datas;
}
