import Router from '@koa/router';
import AJV from 'ajv';
import { DocumentService } from './services/DocumentService';
import { SpaceService } from './services/SpaceService';
import { TaskService } from './services/TaskService';

export {
  Annotation,
  AnnotationData,
  DocumentMeta as MetaData,
} from '@inkstain/client-api';

export type Context = Router.RouterContext & {
  validator: AJV;
  spaceService: SpaceService;
  documentService: DocumentService;
  taskService: TaskService;
};
