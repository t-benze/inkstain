import Router from '@koa/router';
import AJV from 'ajv';
import { DocumentSearchService } from './services/DocumentSearchService';
import { SpaceService } from './services/SpaceService';
import { TaskService } from './services/TaskService';
import { AuthService } from './services/AuthService';
import { FileService } from './services/FileService';
import { IntelligenceService } from './services/IntelligenceService';
import {
  Space,
  UserInfo,
  SignUpRequest,
  ConfirmSignUpRequest,
  SignInRequest,
  ForgotPasswordRequest,
  ConfirmForgotPasswordRequest,
  Annotation,
  AnnotationData,
  DocumentMeta,
  DocumentTextDetectionData,
} from '@inkstain/client-api';

export {
  UserInfo,
  SignUpRequest,
  ConfirmSignUpRequest,
  SignInRequest,
  ForgotPasswordRequest,
  ConfirmForgotPasswordRequest,
  Annotation,
  AnnotationData,
  DocumentMeta as MetaData,
  DocumentTextDetectionData,
  Space,
};

export type Context = Router.RouterContext & {
  validator: AJV;
  spaceService: SpaceService;
  documentService: DocumentSearchService;
  taskService: TaskService;
  authService: AuthService;
  intelligenceService: IntelligenceService;
  fileService: FileService;
};

export type DocLayoutIndex = {
  status: 'completed' | 'partial';
  indexMap: {
    [key: string]: number;
  };
};

export type WebclipData = {
  imageData: string;
  dimension: { width: number; height: number };
};
