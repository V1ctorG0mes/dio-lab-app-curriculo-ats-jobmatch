import { describe, expect, it } from "vitest";
import { analyze } from "./ats";
import { buildDocxFileName, buildResumeDocxBlob } from "./resume-docx";
import { SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND } from "./samples";

describe("Word (.docx) export", () => {
  it("formats sanitized ATS filenames", () => {
    expect(buildDocxFileName("Marina Costa")).toBe("Curriculo-Marina-Costa-ATS.docx");
    expect(buildDocxFileName("João Sílva Júnior")).toBe("Curriculo-Joao-Silva-Junior-ATS.docx");
    expect(buildDocxFileName("")).toBe("Curriculo-Otimizado-ATS.docx");
  });

  it("generates a valid .docx OpenXML archive blob from the optimized resume", async () => {
    const { resume } = analyze(SAMPLE_JOB_FRONTEND, SAMPLE_RESUME_FRONTEND);
    const blob = await buildResumeDocxBlob(resume);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(2000);

    const buf = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob.slice(0, 2));
    });
    const bytes = new Uint8Array(buf);
    // .docx files are ZIP containers starting with "PK" (0x50, 0x4B)
    expect(String.fromCharCode(bytes[0]!, bytes[1]!)).toBe("PK");
  });
});
