export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  // Configure worker via CDN to avoid bundler worker plumbing.
  // pdfjs.version is the bundled version.
  const version = (pdfjs as unknown as { version: string }).version;
  (pdfjs as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

  const buf = await file.arrayBuffer();
  const loadingTask = (pdfjs as unknown as {
    getDocument: (a: { data: ArrayBuffer }) => { promise: Promise<unknown> };
  }).getDocument({ data: buf });
  const pdf = (await loadingTask.promise) as {
    numPages: number;
    getPage: (n: number) => Promise<{
      getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
    }>;
  };
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text +=
      content.items.map((it) => it.str ?? "").join(" ") + "\n";
  }
  return text.trim();
}