import Router from '@koa/router';
import AJV from 'ajv';
import { DocumentSearchService } from './services/DocumentSearchService';
import { SpaceService } from './services/SpaceService';
import { TaskService } from './services/TaskService';
import { AuthService } from './services/AuthService';
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
};

export { Space };

export interface AuthProxy {
  isAuthenticated: () => Promise<boolean>;
  userInfo: () => Promise<UserInfo>;
  signUp: (request: SignUpRequest) => Promise<void>;
  confirmSignUp: (request: ConfirmSignUpRequest) => Promise<void>;
  signIn: (request: SignInRequest) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (request: ForgotPasswordRequest) => Promise<void>;
  confirmForgotPassword: (
    request: ConfirmForgotPasswordRequest
  ) => Promise<void>;
}

export interface IntelligenceProxy {
  /**
   * Analyzes a document image and returns the layout data
   * @param image - The base64 encoded document image
   * @returns The layout data of the document
   */
  analyzeImage: (image: string) => Promise<DocumentTextDetectionData>;
}

export type Context = Router.RouterContext & {
  validator: AJV;
  spaceService: SpaceService;
  documentService: DocumentSearchService;
  taskService: TaskService;
  authService: AuthService;
  intelligenceService: IntelligenceService;
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
