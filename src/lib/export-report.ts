// Exports the ReportTemplate element as a single continuous PDF page
// (no cuts) using html2canvas + jsPDF directly for reliability.
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

async function waitForImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
        // Failsafe timeout so a broken image never blocks the export
        setTimeout(done, 3000);
      });
    }),
  );
}

export async function exportReportPdf(
  element: HTMLElement,
  filename = "analytics-report.pdf",
) {
  await waitForImages(element);
  // Small tick so React/layout settles
  await new Promise((r) => setTimeout(r, 100));

  const width = element.offsetWidth || 794;

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#0A0A0A",
    useCORS: true,
    allowTaint: true,
    logging: false,
    windowWidth: width,
    width,
    height: element.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pdfWidth = canvas.width;
  const pdfHeight = canvas.height;

  const pdf = new jsPDF({
    unit: "px",
    format: [pdfWidth, pdfHeight],
    orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
    hotfixes: ["px_scaling"],
  });

  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
  pdf.save(filename);
}
