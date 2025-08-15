export interface PDFNavData {
  documentId: string;
  filename: string;
  page: number;
  context: string;
  highlight?: {
    text: string;
  };
}
