export interface Document {
  type: string;
  name: string;
}

export interface Space {
  key: string;
  name: string;
  path: string;
}

export type SystemDocumentType = '@inkstain/space-management';
