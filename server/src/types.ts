import Router from '@koa/router';
import AJV from 'ajv';
import { DocumentService } from '~/server/services/DocumentService';
import { SpaceService } from '~/server/services/SpaceService';

export type Context = Router.RouterContext & {
  validator: AJV;
  spaceService: SpaceService;
  documentService: DocumentService;
};

interface Attributes {
  title: string;
  author: Array<string>;
}

export interface MetaData {
  mimetype: string;
  tags?: string[];
  attributes?: Attributes;
}
