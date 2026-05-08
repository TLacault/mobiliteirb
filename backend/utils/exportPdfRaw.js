/**
 * Raw (no-dependency) PDF builder for mobility export.
 * Produces a plain-text PDF using only core PDF syntax — no external library required.
 */

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const MAX_CHARS_PER_LINE = 96;
const LINE_HEIGHT = 12;
const LINES_PER_PAGE = Math.floor((PAGE_HEIGHT - MARGIN * 2) / LINE_HEIGHT);

function normalizePdfText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, " ")
    .replace(/[^\x20-\x7E]/g, "?");
}

function wrapPdfText(value, maxLength) {
  const words = normalizePdfText(value)
    .replace(/\t/g, "    ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return [""];

  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    if (word.length > maxLength) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }
      for (let i = 0; i < word.length; i += maxLength) {
        lines.push(word.slice(i, i + maxLength));
      }
      return;
    }

    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length > maxLength) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [""];
}

function addTitle(lines, text) {
  lines.push({
    text: text.toUpperCase(),
    size: 18,
    isBold: true,
    indent: 0,
    spacing: 20,
  });
}

function addSubtitle(lines, text) {
  lines.push({ text, size: 13, isBold: true, indent: 0, spacing: 15 });
}

function addBody(lines, text, indent = 0) {
  String(text ?? "")
    .split(/\r?\n/)
    .forEach((part) => {
      wrapPdfText(part, MAX_CHARS_PER_LINE - indent / 5).forEach((l) =>
        lines.push({ text: l, size: 10, isBold: false, indent, spacing: 12 }),
      );
    });
}

function addSpacer(lines, count = 1) {
  for (let i = 0; i < count; i += 1) {
    lines.push({ text: "", size: 10, isBold: false, indent: 0, spacing: 10 });
  }
}

function formatWholeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? String(Math.round(n)) : "-";
}

function formatTime(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "-";
  const h = Math.floor(n / 60);
  const m = Math.round(n % 60);
  return `${h > 0 ? `${h}h ` : ""}${m}min`;
}

function buildPdfLines(mobility) {
  const lines = [];

  addTitle(lines, mobility.name || "RAPPORT DE MOBILITE");
  lines.push({
    text: "________________________________________________",
    size: 10,
    indent: 0,
    spacing: 5,
  });
  addSpacer(lines, 2);

  addSubtitle(lines, "Details de la mission");
  if (mobility.startLocation)
    addBody(lines, `Depart : ${mobility.startLocation}`, 10);
  if (mobility.endLocation)
    addBody(lines, `Arrivee : ${mobility.endLocation}`, 10);
  addSpacer(lines, 2);

  (mobility.trips || []).forEach((trip, i) => {
    addSubtitle(lines, `Trajet ${i + 1} : ${trip.name || "Sans nom"}`);
    addSpacer(lines, 1);
    (trip.steps || []).forEach((step) => {
      const info = `${step.transportMode} | ${formatWholeNumber(
        step.distance,
      )}km | ${formatWholeNumber(step.carbon)}kg CO2 | ${formatTime(
        step.time,
      )}`;
      addBody(lines, `- ${step.labelStart} => ${step.labelEnd}`, 20);
      addBody(lines, `  [ ${info} ]`, 30);
      addSpacer(lines, 1);
    });
    addSpacer(lines, 1);
  });

  return lines;
}

function buildPdfPageContent(pageLines) {
  const commands = ["BT"];
  let currentY = PAGE_HEIGHT - MARGIN;

  pageLines.forEach((lineObj) => {
    const line =
      typeof lineObj === "string"
        ? { text: lineObj, size: 10, isBold: false, indent: 0, spacing: 10 }
        : lineObj;
    const { text, size, indent, spacing } = line;
    currentY -= spacing;
    commands.push(`/F1 ${size} Tf`);
    commands.push(`1 0 0 1 ${MARGIN + indent} ${currentY} Tm`);
    commands.push(`(${normalizePdfText(text)}) Tj`);
  });

  commands.push("ET");
  return commands.join("\n");
}

function buildPdfBuffer(lines) {
  const pages = [];
  for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
    pages.push(lines.slice(i, i + LINES_PER_PAGE));
  }

  const objects = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  const pageObjectIds = Array.from(
    { length: pages.length },
    (_, i) => 4 + i * 2,
  );
  objects.push(
    `<< /Type /Pages /Kids [${pageObjectIds
      .map((id) => `${id} 0 R`)
      .join(" ")}] /Count ${pages.length} >>`,
  );
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  pages.forEach((pageLines, i) => {
    const pageObjectId = 4 + i * 2;
    const contentObjectId = pageObjectId + 1;
    const contentStream = buildPdfPageContent(pageLines);
    const contentLength = Buffer.byteLength(contentStream, "ascii");
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH.toFixed(
        2,
      )} ${PAGE_HEIGHT.toFixed(
        2,
      )}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
    );
    objects.push(
      `<< /Length ${contentLength} >>\nstream\n${contentStream}\nendstream`,
    );
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${
    objects.length + 1
  } /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "ascii");
}

/**
 * Generate a plain-text PDF buffer from mobility data (no external dependencies).
 * @param {Object} mobility
 * @returns {Buffer}
 */
function generateMobilityPdfRaw(mobility) {
  return buildPdfBuffer(buildPdfLines(mobility));
}

module.exports = { generateMobilityPdfRaw };
