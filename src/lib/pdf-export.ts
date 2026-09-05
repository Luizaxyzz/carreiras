import type { StructuredResume } from "./matchcv-types";

type PdfLine = { text: string; size?: number; bold?: boolean; gap?: number };

function clean(text: string | undefined | null) {
  return (text ?? "").replace(/[\u2013\u2014]/g, "-").replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, " ").trim();
}

function wrap(text: string, max = 92) {
  const words = clean(text).split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max && current) { lines.push(current); current = word; }
    else current = next;
  }
  if (current) lines.push(current);
  return lines;
}

function esc(text: string) {
  return clean(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function latin1Bytes(text: string) {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    bytes[i] = code <= 255 ? code : 63;
  }
  return bytes;
}

function section(lines: PdfLine[], title: string, body: string[]) {
  if (!body.length) return;
  lines.push({ text: title.toUpperCase(), size: 11, bold: true, gap: 8 });
  for (const item of body) lines.push({ text: item, size: 9.5 });
  lines.push({ text: "", gap: 7 });
}

function resumeLines(resume: StructuredResume): PdfLine[] {
  const lines: PdfLine[] = [];
  const info = resume.personal_info;
  lines.push({ text: clean(info.full_name) || "Currículo", size: 20, bold: true, gap: 4 });
  if (info.headline) lines.push({ text: clean(info.headline), size: 11, bold: true, gap: 4 });
  const contact = [info.phone, info.email, info.location].filter(Boolean).map((v) => clean(v)).join(" | ");
  if (contact) lines.push({ text: contact, size: 9, gap: 8 });

  if (resume.objective) section(lines, "Objetivo", wrap(resume.objective));
  if (resume.professional_summary) section(lines, "Resumo profissional", wrap(resume.professional_summary));

  if (resume.experience?.length) {
    lines.push({ text: "EXPERIÊNCIA PROFISSIONAL", size: 11, bold: true, gap: 8 });
    for (const exp of resume.experience) {
      const dates = [exp.start_date, exp.end_date].filter(Boolean).join(" - ");
      lines.push({ text: `${clean(exp.role)}${exp.company ? ` | ${clean(exp.company)}` : ""}${dates ? ` | ${clean(dates)}` : ""}`, size: 10, bold: true, gap: 2 });
      for (const bullet of exp.bullets ?? []) for (const part of wrap(`• ${bullet}`, 88)) lines.push({ text: part, size: 9.3 });
      lines.push({ text: "", gap: 5 });
    }
  }

  if (resume.skills?.length) section(lines, "Competências técnicas", wrap(resume.skills.join(" • "), 90));
  if (resume.differentiators?.length) section(lines, "Habilidades e diferenciais", wrap(resume.differentiators.join(" • "), 90));

  if (resume.education?.length) {
    lines.push({ text: "FORMAÇÃO ACADÊMICA", size: 11, bold: true, gap: 8 });
    for (const ed of resume.education) {
      const dates = [ed.start_date, ed.end_date].filter(Boolean).join(" - ");
      lines.push({ text: `${clean(ed.degree)} | ${clean(ed.institution)}${dates ? ` | ${clean(dates)}` : ""}`, size: 9.7, bold: true });
      if (ed.details) for (const part of wrap(ed.details)) lines.push({ text: part, size: 9.2 });
    }
    lines.push({ text: "", gap: 7 });
  }

  if (resume.certifications?.length) section(lines, "Cursos e certificações", resume.certifications.flatMap((c) => wrap(`${c.name}${c.issuer ? ` - ${c.issuer}` : ""}${c.year ? ` (${c.year})` : ""}`)));
  if (resume.projects?.length) {
    lines.push({ text: "PROJETOS", size: 11, bold: true, gap: 8 });
    for (const p of resume.projects) {
      lines.push({ text: clean(p.name), size: 9.7, bold: true });
      for (const part of wrap(p.description)) lines.push({ text: part, size: 9.2 });
      if (p.tech?.length) lines.push({ text: `Tecnologias: ${p.tech.join(", ")}`, size: 9.1 });
    }
    lines.push({ text: "", gap: 7 });
  }
  if (resume.languages?.length) section(lines, "Idiomas", wrap(resume.languages.map((l) => `${l.name}${l.level ? ` - ${l.level}` : ""}`).join(" | ")));
  return lines;
}

function buildPdf(resume: StructuredResume) {
  const all = resumeLines(resume);
  const pages: PdfLine[][] = [[]];
  let y = 800;
  for (const line of all) {
    const size = line.size ?? 9.5;
    const step = size + 4 + (line.gap ?? 0);
    if (y - step < 45) { pages.push([]); y = 800; }
    pages[pages.length - 1].push(line);
    y -= step;
  }

  const objects: string[] = [];
  const add = (s: string) => { objects.push(s); return objects.length; };
  const fontRegular = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const fontBold = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const pageRefs: number[] = [];
  const contentRefs: number[] = [];
  const pageContents = pages.map((page) => {
    let py = 800;
    const chunks: string[] = [];
    for (const line of page) {
      const size = line.size ?? 9.5;
      if (line.text) chunks.push(`BT /${line.bold ? "F2" : "F1"} ${size} Tf 50 ${py} Td (${esc(line.text)}) Tj ET`);
      py -= size + 4 + (line.gap ?? 0);
    }
    return chunks.join("\n");
  });

  for (const stream of pageContents) contentRefs.push(add(`<< /Length ${latin1Bytes(stream).length} >>\nstream\n${stream}\nendstream`));
  const pagesObjectIndex = objects.length + pages.length + 1;
  for (let i = 0; i < pages.length; i++) pageRefs.push(add(`<< /Type /Page /Parent ${pagesObjectIndex} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentRefs[i]} 0 R >>`));
  const pagesIndex = add(`<< /Type /Pages /Kids [${pageRefs.map((r) => `${r} 0 R`).join(" ")}] /Count ${pageRefs.length} >>`);
  const catalogIndex = add(`<< /Type /Catalog /Pages ${pagesIndex} 0 R >>`);

  let pdf = "%PDF-1.4\n%âãÏÓ\n";
  const offsets = [0];
  objects.forEach((obj, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogIndex} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return latin1Bytes(pdf);
}

export function downloadResumePdf(resume: StructuredResume) {
  const bytes = buildPdf(resume);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = clean(resume.personal_info.full_name || "curriculo").replace(/[^a-zA-Z0-9À-ÿ_-]+/g, "-").replace(/^-|-$/g, "");
  a.href = url;
  a.download = `${safeName || "curriculo"}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
