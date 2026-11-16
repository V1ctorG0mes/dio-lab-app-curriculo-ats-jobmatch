import { describe, expect, it } from "vitest";
import { getResumeFileKind } from "./resume-file";

describe("résumé upload formats", () => {
  it("accepts .txt, .md, .docx and .pdf", () => {
    expect(getResumeFileKind("cv.txt")).toBe("text");
    expect(getResumeFileKind("CV.MD")).toBe("text");
    expect(getResumeFileKind("curriculo.docx")).toBe("docx");
    expect(getResumeFileKind("curriculo.final.pdf")).toBe("pdf");
  });

  it("rejects other formats", () => {
    expect(getResumeFileKind("cv.doc")).toBeNull();
    expect(getResumeFileKind("foto.png")).toBeNull();
    expect(getResumeFileKind("semextensao")).toBeNull();
  });
});
