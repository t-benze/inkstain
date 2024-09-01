import Router from '@koa/router';
import AJV from 'ajv';
import { DocumentService } from './services/DocumentService';
import { SpaceService } from './services/SpaceService';
import { TaskService } from './services/TaskService';
import { AuthService } from './services/AuthService';
import { IntelligenceService } from './services/IntelligenceService';
import {
  UserInfo,
  SignUpRequest,
  ConfirmSignUpRequest,
  SignInRequest,
  ForgotPasswordRequest,
  ConfirmForgotPasswordRequest,
  Annotation,
  AnnotationData,
  DocumentMeta,
  DocumentTextDetectionDataInner,
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
  DocumentTextDetectionDataInner,
};

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
  analyzeDocument: (image: string) => Promise<DocumentTextDetectionDataInner[]>;
}

export type Context = Router.RouterContext & {
  validator: AJV;
  spaceService: SpaceService;
  documentService: DocumentService;
  taskService: TaskService;
  authService: AuthService;
  intelligenceService: IntelligenceService;
};
