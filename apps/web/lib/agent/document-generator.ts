/**
 * Generates file bytes for agent-created documents.
 * Supports: .docx, .xlsx, .pdf, .csv
 */

export type DocParagraph = {
  text: string;
  style?: "heading1" | "heading2" | "heading3" | "body" | "bullet";
};

export type TableContent = {
  headers: string[];
  rows: string[][];
};

export type DocumentContent =
  | { kind: "doc"; paragraphs: DocParagraph[] }
  | { kind: "sheet"; sheets: { name: string; table: TableContent }[] }
  | { kind: "pdf"; paragraphs: DocParagraph[] }
  | { kind: "csv"; table: TableContent };

export type GeneratedDocument = {
  buffer: Buffer;
  mimeType: string;
  extension: string;
};

export async function generateDocument(
  format: "docx" | "xlsx" | "pdf" | "csv",
  content: DocumentContent
): Promise<GeneratedDocument> {
  switch (format) {
    case "docx":
      return generateDocx(content as { kind: "doc"; paragraphs: DocParagraph[] });
    case "xlsx":
      return generateXlsx(content as { kind: "sheet"; sheets: { name: string; table: TableContent }[] });
    case "pdf":
      return generatePdf(content as { kind: "pdf"; paragraphs: DocParagraph[] });
    case "csv":
      return generateCsv(content as { kind: "csv"; table: TableContent });
    default:
      throw new Error(`Formato no soportado: ${format as string}`);
  }
}

async function generateDocx(content: {
  kind: "doc";
  paragraphs: DocParagraph[];
}): Promise<GeneratedDocument> {
  const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import("docx");

  const children = content.paragraphs.map((p) => {
    const run = new TextRun({ text: p.text });
    if (p.style === "heading1") {
      return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run] });
    }
    if (p.style === "heading2") {
      return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [run] });
    }
    if (p.style === "heading3") {
      return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [run] });
    }
    if (p.style === "bullet") {
      return new Paragraph({ bullet: { level: 0 }, children: [run] });
    }
    return new Paragraph({ children: [run] });
  });

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const arrayBuffer = await Packer.toBuffer(doc);
  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extension: "docx",
  };
}

async function generateXlsx(content: {
  kind: "sheet";
  sheets: { name: string; table: TableContent }[];
}): Promise<GeneratedDocument> {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();

  for (const sheet of content.sheets) {
    const ws = workbook.addWorksheet(sheet.name || "Hoja 1");
    if (sheet.table.headers.length > 0) {
      ws.addRow(sheet.table.headers).font = { bold: true };
    }
    for (const row of sheet.table.rows) {
      ws.addRow(row);
    }
    ws.columns.forEach((col) => {
      col.width = 18;
    });
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: "xlsx",
  };
}

async function generatePdf(content: {
  kind: "pdf";
  paragraphs: DocParagraph[];
}): Promise<GeneratedDocument> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const PAGE_WIDTH = 595;
  const PAGE_HEIGHT = 842;
  const MARGIN = 50;
  const LINE_HEIGHT = 18;
  const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const addPage = () => {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  };

  const wrapText = (text: string, maxWidth: number, chosenFont: typeof font, fontSize: number): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = chosenFont.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  for (const para of content.paragraphs) {
    const isHeading =
      para.style === "heading1" ||
      para.style === "heading2" ||
      para.style === "heading3";
    const chosenFont = isHeading ? boldFont : font;
    const fontSize =
      para.style === "heading1"
        ? 18
        : para.style === "heading2"
          ? 15
          : para.style === "heading3"
            ? 13
            : 11;
    const extraSpaceBefore = isHeading ? 8 : 0;

    const lines = wrapText(para.text, MAX_WIDTH, chosenFont, fontSize);
    const blockHeight = lines.length * LINE_HEIGHT + extraSpaceBefore;

    if (y - blockHeight < MARGIN) addPage();

    y -= extraSpaceBefore;
    for (const line of lines) {
      page.drawText(line, {
        x: MARGIN,
        y,
        size: fontSize,
        font: chosenFont,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= LINE_HEIGHT;
    }
    y -= 4;
  }

  const bytes = await doc.save();
  return {
    buffer: Buffer.from(bytes),
    mimeType: "application/pdf",
    extension: "pdf",
  };
}

function generateCsv(content: {
  kind: "csv";
  table: TableContent;
}): GeneratedDocument {
  const escape = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const lines: string[] = [];
  if (content.table.headers.length > 0) {
    lines.push(content.table.headers.map(escape).join(","));
  }
  for (const row of content.table.rows) {
    lines.push(row.map(escape).join(","));
  }

  return {
    buffer: Buffer.from(lines.join("\n"), "utf-8"),
    mimeType: "text/csv",
    extension: "csv",
  };
}
