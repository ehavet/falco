export interface PDFProcessor {
  readPdfFile (filePath: string, partnerCode: string): Promise<Buffer>
  formatPdfBufferProperly (pdfBuffer: Buffer): Promise<Buffer>
}
