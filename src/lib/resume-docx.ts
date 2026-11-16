import {
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";
import type { OptimizedResume } from "./ats";
import { highlightBullet, layoutSection, type LayoutBlock } from "./resume-layout";

const FONT = "Arial";
const PAGE_WIDTH_TWIPS = 11906; // A4 width (210mm)
const PAGE_HEIGHT_TWIPS = 16838; // A4 height (297mm)
const MARGIN_TWIPS = 850; // ~15mm margin
const CONTENT_WIDTH_TWIPS = PAGE_WIDTH_TWIPS - MARGIN_TWIPS * 2;

const COLOR_DARK = "0F172A";
const COLOR_BODY = "334155";
const COLOR_MUTED = "64748B";
const COLOR_VIOLET = "6D28D9";
const COLOR_BORDER = "CBD5E1";

function bulletRuns(text: string): TextRun[] {
  return highlightBullet(text).map(
    (run) =>
      new TextRun({
        text: run.text,
        bold: Boolean(run.strong),
        font: FONT,
        size: 20, // 10pt
        color: run.strong ? COLOR_DARK : COLOR_BODY,
      }),
  );
}

function blockToParagraphs(block: LayoutBlock): Paragraph[] {
  if (block.type === "paragraph") {
    return [
      new Paragraph({
        spacing: { after: 100, line: 276 },
        children: [
          new TextRun({
            text: block.text,
            font: FONT,
            size: 20,
            color: COLOR_BODY,
          }),
        ],
      }),
    ];
  }

  if (block.type === "skills") {
    return block.rows.map(
      (row) =>
        new Paragraph({
          spacing: { after: 60, line: 264 },
          children: [
            ...(row.label
              ? [
                  new TextRun({
                    text: `${row.label}: `,
                    bold: true,
                    font: FONT,
                    size: 20,
                    color: COLOR_DARK,
                  }),
                ]
              : []),
            new TextRun({
              text: row.value,
              font: FONT,
              size: 20,
              color: COLOR_BODY,
            }),
          ],
        }),
    );
  }

  if (block.type === "bullets") {
    return block.items.map(
      (item) =>
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60, line: 264 },
          children: bulletRuns(item),
        }),
    );
  }

  if (block.type === "entry") {
    const out: Paragraph[] = [];
    const headerChildren: TextRun[] = [
      new TextRun({
        text: block.title,
        bold: true,
        font: FONT,
        size: 21, // 10.5pt
        color: COLOR_DARK,
      }),
    ];
    if (block.org) {
      headerChildren.push(
        new TextRun({
          text: ` — ${block.org}`,
          font: FONT,
          size: 21,
          color: COLOR_BODY,
        }),
      );
    }
    if (block.period) {
      headerChildren.push(
        new TextRun({
          text: `\t${block.period}`,
          font: FONT,
          size: 19,
          color: COLOR_MUTED,
        }),
      );
    }

    out.push(
      new Paragraph({
        keepNext: true,
        spacing: { before: 80, after: 40 },
        ...(block.period
          ? { tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH_TWIPS }] }
          : {}),
        children: headerChildren,
      }),
    );

    block.notes.forEach((note, idx) => {
      const isSubtitle = idx === 0 && note.length <= 95 && !/[.!?]$/.test(note);
      out.push(
        new Paragraph({
          keepNext: isSubtitle && block.bullets.length > 0,
          spacing: { after: 60, line: 264 },
          children: [
            new TextRun({
              text: note,
              bold: isSubtitle,
              font: FONT,
              size: 20,
              color: isSubtitle ? COLOR_VIOLET : COLOR_BODY,
            }),
          ],
        }),
      );
    });

    for (const bullet of block.bullets) {
      out.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60, line: 264 },
          children: bulletRuns(bullet),
        }),
      );
    }

    return out;
  }

  return [];
}

/** Builds a clean, single-column ATS-compliant Word (.docx) Blob from an OptimizedResume. */
export async function buildResumeDocxBlob(resume: OptimizedResume): Promise<Blob> {
  const children: Paragraph[] = [
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: resume.name.toUpperCase(),
          bold: true,
          font: FONT,
          size: 36, // 18pt
          color: COLOR_DARK,
        }),
      ],
    }),
  ];

  if (resume.contact.length > 0) {
    children.push(
      new Paragraph({
        spacing: { after: 180 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER, space: 6 },
        },
        children: [
          new TextRun({
            text: resume.contact.join(" • "),
            font: FONT,
            size: 19, // 9.5pt
            color: COLOR_MUTED,
          }),
        ],
      }),
    );
  }

  for (const section of resume.sections) {
    children.push(
      new Paragraph({
        keepNext: true,
        spacing: { before: 180, after: 80 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER, space: 4 },
        },
        children: [
          new TextRun({
            text: section.title.toUpperCase(),
            bold: true,
            font: FONT,
            size: 20, // 10pt
            color: COLOR_VIOLET,
          }),
        ],
      }),
    );

    const blocks = layoutSection(section);
    for (const block of blocks) {
      children.push(...blockToParagraphs(block));
    }
  }

  const doc = new Document({
    creator: "JobMatch ATS",
    title: `${resume.name} - Currículo ATS`,
    description: "Currículo estruturado em coluna única para compatibilidade com sistemas ATS.",
    sections: [
      {
        properties: {
          page: {
            size: {
              width: PAGE_WIDTH_TWIPS,
              height: PAGE_HEIGHT_TWIPS,
            },
            margin: {
              top: MARGIN_TWIPS,
              right: MARGIN_TWIPS,
              bottom: MARGIN_TWIPS,
              left: MARGIN_TWIPS,
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export function buildDocxFileName(candidateName: string): string {
  const clean = candidateName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return clean ? `Curriculo-${clean}-ATS.docx` : "Curriculo-Otimizado-ATS.docx";
}

export async function downloadResumeDocx(resume: OptimizedResume): Promise<string> {
  const blob = await buildResumeDocxBlob(resume);
  const fileName = buildDocxFileName(resume.name);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return fileName;
}
