import {
  AlignmentType,
  BorderStyle,
  Footer,
  Header,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from '../../mconnect/backend/node_modules/docx/dist/index.mjs';

export const THEME = {
  primary: '7C3AED',
  primaryDark: '5B21B6',
  primarySoft: 'A78BFA',
  tint: 'EDE9FE',
  zebra: 'F5F3FF',
  ink: '111827',
  muted: '6B7280',
  line: 'E5E7EB',
  white: 'FFFFFF',
  dark: '0D0F17',
};

export const FONT = 'Segoe UI';

export function rich(text, { color = THEME.ink, size = 21, italic = false } = {}) {
  if (Array.isArray(text)) return text;
  const runs = [];
  for (const part of String(text).split(/(\*\*[^*]+\*\*)/g)) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, color, size, font: FONT, italics: italic }));
    } else {
      runs.push(new TextRun({ text: part, color, size, font: FONT, italics: italic }));
    }
  }
  return runs;
}

export const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: opts.after ?? 130, before: opts.before ?? 0, line: 276 },
    children: rich(text, { color: opts.color, size: opts.size, italic: opts.italic }),
    ...(opts.alignment ? { alignment: opts.alignment } : {}),
    ...(opts.keepNext ? { keepNext: true } : {}),
  });

export const h1 = (text) =>
  new Paragraph({
    spacing: { before: 360, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: THEME.primary, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 30, color: THEME.primaryDark, font: FONT })],
    keepNext: true,
  });

export const h2 = (text) =>
  new Paragraph({
    spacing: { before: 260, after: 110 },
    children: [new TextRun({ text, bold: true, size: 24, color: THEME.primary, font: FONT })],
    keepNext: true,
  });

export const h3 = (text) =>
  new Paragraph({
    spacing: { before: 200, after: 90 },
    children: [new TextRun({ text, bold: true, size: 21, color: THEME.ink, font: FONT })],
    keepNext: true,
  });

export const bullet = (text, { level = 0, after = 70 } = {}) =>
  new Paragraph({
    bullet: { level },
    spacing: { after, line: 276 },
    children: rich(text, { size: 21 }),
  });

export function callout(title, body) {
  const shared = {
    shading: { type: ShadingType.CLEAR, fill: THEME.tint, color: 'auto' },
    border: { left: { style: BorderStyle.SINGLE, size: 28, color: THEME.primary, space: 10 } },
    indent: { left: 220, right: 200 },
  };
  return [
    new Paragraph({
      ...shared,
      spacing: { before: 180, after: 50 },
      children: [new TextRun({ text: title, bold: true, size: 22, color: THEME.primaryDark, font: FONT })],
    }),
    new Paragraph({
      ...shared,
      spacing: { after: 220, line: 276 },
      children: rich(body, { size: 21 }),
    }),
  ];
}

export const quote = (text, author) => [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 280, after: 40 },
    shading: { type: ShadingType.CLEAR, fill: THEME.tint, color: 'auto' },
    border: {
      top: { style: BorderStyle.SINGLE, size: 8, color: THEME.primarySoft, space: 8 },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: THEME.primarySoft, space: 8 },
    },
    indent: { left: 400, right: 400 },
    children: [new TextRun({ text: '“' + text + '”', italics: true, size: 24, color: THEME.primaryDark, font: FONT })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 280 },
    children: [new TextRun({ text: '— ' + author, size: 20, color: THEME.muted, font: FONT, italics: true })],
  }),
];

export const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

export const spacer = (after = 200) => new Paragraph({ spacing: { after }, children: [] });

const GRID = {
  top: { style: BorderStyle.SINGLE, size: 4, color: THEME.line },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: THEME.line },
  left: { style: BorderStyle.SINGLE, size: 4, color: THEME.line },
  right: { style: BorderStyle.SINGLE, size: 4, color: THEME.line },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: THEME.line },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: THEME.line },
};

export function tbl({ headers, rows, widths, bodySize = 20 }) {
  const makeCell = (content, { header = false, fill = null, width } = {}) => {
    const runs = rich(content, {
      color: header ? THEME.white : THEME.ink,
      size: header ? 20 : bodySize,
    });
    return new TableCell({
      width: { size: width, type: WidthType.PERCENTAGE },
      shading: fill || (header ? { type: ShadingType.CLEAR, fill: THEME.primary, color: 'auto' } : null) || undefined,
      margins: { top: 80, bottom: 80, left: 140, right: 140 },
      children: [new Paragraph({ spacing: { after: 0, line: 264 }, children: runs })],
    });
  };
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => makeCell(h, { header: true, width: widths[i] })),
  });
  const bodyRows = rows.map((row, r) => {
    const fill = r % 2 === 1 ? { type: ShadingType.CLEAR, fill: THEME.zebra, color: 'auto' } : null;
    return new TableRow({
      children: row.map((c, i) => makeCell(c, { width: widths[i], fill })),
    });
  });
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    borders: GRID,
    rows: [headerRow, ...bodyRows],
  });
}

export const tblGap = () => new Paragraph({ spacing: { after: 180 }, children: [] });

export const headerFooter = ({ docTitle }) => {
  const header = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: THEME.primarySoft, space: 4 } },
        children: [
          new TextRun({ text: 'MConnect', bold: true, size: 18, color: THEME.primary, font: FONT }),
          new TextRun({ text: `   •   ${docTitle}`, size: 18, color: THEME.muted, font: FONT }),
        ],
      }),
    ],
  });
  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: THEME.line, space: 4 } },
        children: [
          new TextRun({ text: 'Where Growth Meets Guidance      |      Page ', size: 17, color: THEME.muted, font: FONT }),
          new TextRun({ children: [PageNumber.CURRENT], size: 17, color: THEME.muted, font: FONT }),
        ],
      }),
    ],
  });
  return { header, footer };
};

export function cover({ badge, title, subtitle, docType, tagline, meta }) {
  const metaTable = new Table({
    width: { size: 62, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    borders: GRID,
    rows: meta.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 45, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: THEME.tint, color: 'auto' },
            margins: { top: 90, bottom: 90, left: 160, right: 160 },
            children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: label, bold: true, size: 20, color: THEME.primaryDark, font: FONT })] })],
          }),
          new TableCell({
            width: { size: 55, type: WidthType.PERCENTAGE },
            margins: { top: 90, bottom: 90, left: 160, right: 160 },
            children: [new Paragraph({ children: [new TextRun({ text: value, size: 20, color: THEME.ink, font: FONT })] })],
          }),
        ],
      })
    ),
  });

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.CLEAR, fill: THEME.primary, color: 'auto' },
      spacing: { before: 0, after: 0, beforeLines: 5, afterLines: 5 },
      children: [new TextRun({ text: badge, bold: true, size: 26, color: THEME.white, font: FONT, characterSpacing: 90 })],
    }),
    spacer(1000),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: title, bold: true, size: 76, color: THEME.primaryDark, font: FONT })],
    }),
    spacer(140),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: subtitle, size: 30, color: THEME.primary, font: FONT })],
    }),
    spacer(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `✦     ${docType}     ✦`, size: 22, color: THEME.muted, font: FONT })],
    }),
    spacer(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: tagline, italics: true, size: 22, color: THEME.muted, font: FONT })],
    }),
    spacer(1100),
    metaTable,
    spacer(1400),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.CLEAR, fill: THEME.dark, color: 'auto' },
      spacing: { before: 0, after: 0, beforeLines: 4, afterLines: 4 },
      children: [
        new TextRun({ text: 'Where Growth Meets Guidance', bold: true, size: 24, color: THEME.white, font: FONT }),
        new TextRun({ text: '    |    mentorship  •  community  •  growth', size: 18, color: THEME.primarySoft, font: FONT }),
      ],
    }),
  ];
}
