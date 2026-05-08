/**
 * Styled portrait PDF generator for mobility reports.
 * Uses pdfkit to produce a well-formatted A4 portrait document.
 */

const PDFDocument = require("pdfkit");

// ── Palette (hex equivalents of the app's oklch tokens) ──────────────────────
const C = {
  primary: "#52b088",
  primaryDark: "#2e6d7a",
  text: "#1b2c24",
  muted: "#5a7366",
  border: "#d6e8de",
  surface: "#ffffff",
  greenTint: "#e8f5ee",
  greenText: "#2a7a58",
  white: "#ffffff",
  bg: "#f6faf8",
};

// ── Layout constants ──────────────────────────────────────────────────────────
const PAGE = { width: 595.28, height: 841.89 };
const M = { top: 48, right: 42, bottom: 48, left: 42 };
const CONTENT_W = PAGE.width - M.left - M.right;

// ── Helpers ───────────────────────────────────────────────────────────────────
function safeText(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[\u00A0\u202F]/g, " ")
    .trim();
}

function fmtNum(value, decimals = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  const formatted = n.toLocaleString("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return String(formatted).replace(/[\u00A0\u202F]/g, " ");
}

function fmtTime(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return "-";
  const h = Math.floor(n / 60);
  const m = Math.round(n % 60);
  return `${h > 0 ? `${h}h ` : ""}${m} min`;
}

function fmtYear(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : String(d.getFullYear());
}

// ── Drawing helpers ───────────────────────────────────────────────────────────

/**
 * Draw a filled rounded rectangle.
 */
function roundRect(doc, x, y, w, h, r, fillColor) {
  doc.save().roundedRect(x, y, w, h, r).fill(fillColor).restore();
}

/**
 * Draw a horizontal separator line.
 */
function hRule(doc, y, color = C.border) {
  doc
    .save()
    .strokeColor(color)
    .lineWidth(0.75)
    .moveTo(M.left, y)
    .lineTo(M.left + CONTENT_W, y)
    .stroke()
    .restore();
}

/**
 * Ensure there is at least `needed` vertical space remaining on the page.
 * If not, add a new page and reset cursor to `top`.
 */
function ensureSpace(doc, needed) {
  if (doc.y + needed > PAGE.height - M.bottom) {
    doc.addPage();
    doc.y = M.top;
  }
}

// ── Section builders ──────────────────────────────────────────────────────────

function drawHeader(doc, mobility) {
  const x = M.left;
  let y = M.top;

  // Badge pill (top-right)
  const badgeText = safeText("ENSEIRB-MATMECA");
  const badgeW = 130;
  const badgeH = 18;
  const badgeX = M.left + CONTENT_W - badgeW;
  roundRect(doc, badgeX, y, badgeW, badgeH, 9, C.primaryDark);
  doc
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .fillColor(C.white)
    .text(badgeText, badgeX, y + 5, { width: badgeW, align: "center" });

  // Report label
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(C.muted)
    .text(safeText("Mobilite Eirb - Rapport de synthese"), x, y + 2);

  y += 26;

  // Mobility title
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(C.primaryDark)
    .text(safeText(mobility.name || "Mobilite sans titre"), x, y, {
      width: CONTENT_W - badgeW - 8,
    });

  y = doc.y + 6;

  // Meta row
  const metaParts = [];
  if (mobility.startLocation)
    metaParts.push(`Depart : ${mobility.startLocation}`);
  if (mobility.endLocation) metaParts.push(`Arrivee : ${mobility.endLocation}`);
  const year = fmtYear(mobility.year);
  if (year) metaParts.push(year);
  metaParts.push(
    `Exporte le ${new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })}`,
  );

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(C.muted)
    .text(safeText(metaParts.join("   ·   ")), x, y, { width: CONTENT_W });

  y = doc.y + 10;
  hRule(doc, y);
  doc.y = y + 10;
}

function drawStatsRow(doc, allSteps, tripCount) {
  const totalCarbon = allSteps.reduce((s, x) => s + Number(x.carbon ?? 0), 0);
  const totalDist = allSteps.reduce((s, x) => s + Number(x.distance ?? 0), 0);
  const totalTime = allSteps.reduce((s, x) => s + Number(x.time ?? 0), 0);
  const stepCount = allSteps.length;

  const stats = [
    {
      label: "Emissions CO2",
      value: `${fmtNum(totalCarbon, 1)} kg`,
      accent: true,
    },
    { label: "Distance", value: `${fmtNum(totalDist, 0)} km`, accent: false },
    { label: "Duree", value: fmtTime(totalTime), accent: false },
    { label: "Etapes", value: String(stepCount), accent: false },
    { label: "Trajets", value: String(tripCount), accent: false },
  ];

  const cardW = (CONTENT_W - 4 * 6) / 5; // 5 cards, 6px gap
  const cardH = 58;
  const cardY = doc.y;
  const r = 8;

  ensureSpace(doc, cardH + 16);

  stats.forEach((stat, i) => {
    const cardX = M.left + i * (cardW + 6);
    const fill = stat.accent ? C.greenTint : C.surface;
    const border = stat.accent ? C.primary : C.border;

    // Background
    doc
      .save()
      .roundedRect(cardX, cardY, cardW, cardH, r)
      .fillAndStroke(fill, border)
      .restore();

    // Label
    doc
      .font("Helvetica-Bold")
      .fontSize(7)
      .fillColor(stat.accent ? C.greenText : C.muted)
      .text(safeText(stat.label.toUpperCase()), cardX + 8, cardY + 10, {
        width: cardW - 16,
      });

    // Value
    doc
      .font("Helvetica-Bold")
      .fontSize(stat.accent ? 14 : 13)
      .fillColor(stat.accent ? C.primaryDark : C.text)
      .text(safeText(stat.value), cardX + 8, cardY + 24, { width: cardW - 16 });
  });

  doc.y = cardY + cardH + 16;
}

function drawSectionTitle(doc, text) {
  ensureSpace(doc, 32);

  // Accent bar
  doc.save().roundedRect(M.left, doc.y, 4, 20, 2).fill(C.primary).restore();

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(C.text)
    .text(safeText(text), M.left + 12, doc.y + 3, { width: CONTENT_W - 12 });

  doc.y += 28;
}

function drawTripCard(doc, trip, index) {
  const steps = trip.steps || [];
  const tripCarbon = steps.reduce((s, x) => s + Number(x.carbon ?? 0), 0);
  const tripDist = steps.reduce((s, x) => s + Number(x.distance ?? 0), 0);
  const tripTime = steps.reduce((s, x) => s + Number(x.time ?? 0), 0);

  // Header height
  const headerH = 36;
  // Each step row ~18px + thead 22px + padding 12px
  const tableH = steps.length > 0 ? 22 + steps.length * 18 + 12 : 30;
  const cardH = headerH + tableH;

  ensureSpace(doc, cardH + 12);

  const cardX = M.left;
  const cardY = doc.y;
  const cardW = CONTENT_W;
  const r = 8;

  // Card border
  doc
    .save()
    .roundedRect(cardX, cardY, cardW, cardH, r)
    .strokeColor(C.border)
    .lineWidth(1)
    .stroke()
    .restore();

  // Header background (clipped to top corners)
  doc.save();
  doc.roundedRect(cardX, cardY, cardW, headerH, r).clip();
  doc.rect(cardX, cardY + r, cardW, headerH - r).fill(C.greenTint);
  doc.roundedRect(cardX, cardY, cardW, headerH, r).fill(C.greenTint);
  doc.restore();

  // Index circle
  const cx = cardX + 20;
  const cy = cardY + headerH / 2;
  doc.save().circle(cx, cy, 10).fill(C.primary).restore();
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(C.white)
    .text(String(index + 1), cx - 10, cy - 5, { width: 20, align: "center" });

  // Trip name
  doc
    .font("Helvetica-Bold")
    .fontSize(10.5)
    .fillColor(C.text)
    .text(safeText(trip.name || "Trajet sans nom"), cardX + 38, cardY + 7, {
      width: cardW * 0.45,
      lineBreak: false,
      ellipsis: true,
    });

  // Totals (right side)
  const totalsText = safeText(
    `${steps.length} etape(s)   ${fmtNum(tripDist, 1)} km   ${fmtTime(
      tripTime,
    )}   ${fmtNum(tripCarbon, 1)} kg CO2`,
  );
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(C.greenText)
    .text(totalsText, cardX + 38, cardY + 21, {
      width: cardW - 46,
      align: "right",
    });

  // Separator between header and table
  hRule(doc, cardY + headerH, C.border);

  // Table
  const tableY = cardY + headerH + 6;
  const cols = [
    { label: "Transport", x: cardX + 8, w: 74 },
    { label: "Depart", x: cardX + 90, w: 120 },
    { label: "->", x: cardX + 214, w: 16, align: "center" },
    { label: "Arrivee", x: cardX + 234, w: 120 },
    { label: "Distance", x: cardX + 358, w: 50, align: "right" },
    { label: "Duree", x: cardX + 414, w: 50, align: "right" },
    { label: "CO2", x: cardX + 470, w: 35, align: "right" },
  ];

  // Table headers
  cols.forEach((col) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(C.muted)
      .text(safeText(col.label), col.x, tableY, {
        width: col.w,
        align: col.align || "left",
      });
  });

  let rowY = tableY + 16;

  if (steps.length === 0) {
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(C.muted)
      .text("Aucune etape enregistree.", cardX + 8, rowY, {
        width: cardW - 16,
        align: "center",
      });
    rowY += 18;
  }

  steps.forEach((step, si) => {
    // Alternating row tint
    if (si % 2 === 0) {
      doc
        .save()
        .roundedRect(cardX + 2, rowY - 2, cardW - 4, 18, 4)
        .fill("#f8fbf9")
        .restore();
    }

    // Mode badge background
    roundRect(doc, cols[0].x, rowY, 72, 14, 6, C.greenTint);
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(C.greenText)
      .text(safeText(step.transportMode || "-"), cols[0].x + 4, rowY + 2, {
        width: 64,
        lineBreak: false,
        ellipsis: true,
      });

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(C.text)
      .text(safeText(step.labelStart || "-"), cols[1].x, rowY + 1, {
        width: cols[1].w,
        lineBreak: false,
        ellipsis: true,
      });

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(C.muted)
      .text("->", cols[2].x, rowY + 1, { width: cols[2].w, align: "center" });

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(C.text)
      .text(safeText(step.labelEnd || "-"), cols[3].x, rowY + 1, {
        width: cols[3].w,
        lineBreak: false,
        ellipsis: true,
      });

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(C.text)
      .text(safeText(`${fmtNum(step.distance, 1)} km`), cols[4].x, rowY + 1, {
        width: cols[4].w,
        align: "right",
      });

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(C.text)
      .text(safeText(fmtTime(step.time)), cols[5].x, rowY + 1, {
        width: cols[5].w,
        align: "right",
      });

    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .fillColor(C.greenText)
      .text(safeText(`${fmtNum(step.carbon, 1)} kg`), cols[6].x, rowY + 1, {
        width: cols[6].w,
        align: "right",
      });

    rowY += 18;
  });

  doc.y = cardY + cardH + 12;
}

function drawFooter(doc, mobility) {
  const y = PAGE.height - M.bottom + 6;
  hRule(doc, y - 4);
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(C.muted)
    .text(safeText("MobilitEirb — ENSEIRB-MATMECA"), M.left, y, {
      width: CONTENT_W / 2,
    })
    .text(safeText(`Ref. : ${mobility.id || "-"}`), M.left, y, {
      width: CONTENT_W,
      align: "right",
    });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a styled portrait PDF buffer from mobility data using pdfkit.
 * @param {Object} mobility
 * @returns {Promise<Buffer>}
 */
function generateMobilityPdfStyled(mobility) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: M.top, right: M.right, bottom: M.bottom, left: M.left },
      autoFirstPage: true,
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const allSteps = (mobility.trips || []).flatMap((t) => t.steps || []);
    const tripCount = (mobility.trips || []).length;

    // ── Header ──
    drawHeader(doc, mobility);

    // ── Stats row ──
    drawStatsRow(doc, allSteps, tripCount);

    // ── Trips ──
    drawSectionTitle(doc, "Detail des trajets");

    if (!mobility.trips || mobility.trips.length === 0) {
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(C.muted)
        .text("Aucun trajet enregistre.", M.left, doc.y);
    } else {
      (mobility.trips || []).forEach((trip, i) => {
        drawTripCard(doc, trip, i);
      });
    }

    // ── Footer on the current page ──
    drawFooter(doc, mobility);

    doc.end();
  });
}

module.exports = { generateMobilityPdfStyled };
