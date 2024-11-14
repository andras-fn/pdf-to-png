import fs from "fs";
import { createCanvas } from "canvas";
import { getDocument } from "pdfjs-dist";

const pdfPath = process.argv[2];
const outputDir = "output/";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

async function convertPdfToPng(pdfPath, outputDir) {
  const loadingTask = getDocument(pdfPath);
  const pdfDocument = await loadingTask.promise;

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    const out = fs.createWriteStream(`${outputDir}/page-${pageNum}.png`);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on("finish", () => console.log(`Page ${pageNum} converted to PNG`));
  }
}

convertPdfToPng(pdfPath, outputDir).catch(console.error);
