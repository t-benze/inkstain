import Router from '@koa/router';
import AJV from 'ajv';
import { DocumentService } from './services/DocumentService';
import { SpaceService } from './services/SpaceService';
import { TaskService } from './services/TaskService';

export type Context = Router.RouterContext & {
  validator: AJV;
  spaceService: SpaceService;
  documentService: DocumentService;
  taskService: TaskService;
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
