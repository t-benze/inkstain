import { Space, PlatformInfo200Response } from '@inkstain/client-api';
export interface Document {
  type: string;
  name: string;
}

export { Space, PlatformInfo200Response as PlatformData };

export type SystemDocumentType =
  | '@inkstain/space-management'
  | '@inkstain/search-document';

export interface DocumentViewProps {
  spaceKey: string;
  documentPath: string;
}
