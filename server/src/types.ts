import Router from '@koa/router';
import { DocumentSearchService } from './services/DocumentSearchService';
import { SpaceService } from './services/SpaceService';
import { TaskService } from './services/TaskService';
import { AuthService } from './services/AuthService';
import { FileService } from './services/FileService';
import { IntelligenceService } from './services/IntelligenceService';
import { SettingsService } from './services/SettingsService';
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
  Settings,
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
  Settings,
};

export type Context = Router.RouterContext & {
  spaceService: SpaceService;
  documentService: DocumentSearchService;
  taskService: TaskService;
  authService: AuthService;
  intelligenceService: IntelligenceService;
  fileService: FileService;
  settingsService: SettingsService;
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
