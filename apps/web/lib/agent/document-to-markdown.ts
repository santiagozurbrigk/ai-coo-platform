import type { DocumentContent } from "@/lib/agent/document-generator";

export function documentContentToMarkdown(content: DocumentContent): string {
  if (content.kind === "doc" || content.kind === "pdf") {
    return content.paragraphs
      .map((paragraph) => {
        const text = paragraph.text.trim();
        if (!text) return "";
        switch (paragraph.style) {
          case "heading1":
            return `# ${text}`;
          case "heading2":
            return `## ${text}`;
          case "heading3":
            return `### ${text}`;
          case "bullet":
            return `- ${text}`;
          default:
            return text;
        }
      })
      .filter(Boolean)
      .join("\n\n");
  }

  if (content.kind === "csv") {
    return tableToMarkdown(content.table);
  }

  if (content.kind === "sheet") {
    return content.sheets
      .map((sheet) => {
        const table = tableToMarkdown(sheet.table);
        return sheet.name ? `## ${sheet.name}\n\n${table}` : table;
      })
      .join("\n\n");
  }

  return "";
}

function tableToMarkdown(table: { headers: string[]; rows: string[][] }): string {
  const headers = table.headers ?? [];
  const rows = table.rows ?? [];
  if (headers.length === 0 && rows.length === 0) return "";

  const headerRow = headers.length > 0 ? headers : rows[0] ?? [];
  const bodyRows = headers.length > 0 ? rows : rows.slice(1);

  const lines = [
    `| ${headerRow.join(" | ")} |`,
    `| ${headerRow.map(() => "---").join(" | ")} |`,
    ...bodyRows.map((row) => `| ${row.join(" | ")} |`),
  ];

  return lines.join("\n");
}

export function markdownToDocParagraphs(
  markdown: string
): Array<{ text: string; style?: "heading1" | "heading2" | "heading3" | "body" | "bullet" }> {
  const lines = markdown.split("\n");
  const paragraphs: Array<{
    text: string;
    style?: "heading1" | "heading2" | "heading3" | "body" | "bullet";
  }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      paragraphs.push({ text: trimmed.slice(4), style: "heading3" });
      continue;
    }
    if (trimmed.startsWith("## ")) {
      paragraphs.push({ text: trimmed.slice(3), style: "heading2" });
      continue;
    }
    if (trimmed.startsWith("# ")) {
      paragraphs.push({ text: trimmed.slice(2), style: "heading1" });
      continue;
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      paragraphs.push({ text: trimmed.slice(2), style: "bullet" });
      continue;
    }

    paragraphs.push({ text: trimmed, style: "body" });
  }

  return paragraphs.length > 0 ? paragraphs : [{ text: markdown, style: "body" }];
}
