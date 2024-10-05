import { Space } from '@inkstain/client-api';
export interface Document {
  type: string;
  name: string;
}

export { Space };

export type SystemDocumentType =
  | '@inkstain/space-management'
  | '@inkstain/search-document';

export interface DocumentViewProps {
  spaceKey: string;
  documentPath: string;
}
