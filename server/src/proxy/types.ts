import {
  UserInfo,
  SignUpRequest,
  ConfirmSignUpRequest,
  SignInRequest,
  ForgotPasswordRequest,
  ConfirmForgotPasswordRequest,
  DocumentTextDetectionData,
} from '~/server/types';

export interface AuthInterface {
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

export class AuthError extends Error {
  public code: string;
  static readonly CODE_INVALID_TOKENS = 'InvalidTokens';
  static readonly CODE_USER_NOT_FOUND = 'UserNotFoundException';
  static readonly CODE_USER_NOT_CONFIRMED = 'UserNotConfirmedException';
  static readonly CODE_INVALID_PASSWORD = 'InvalidPasswordException';
  static readonly CODE_NOT_AUTHORIZED = 'NotAuthorizedException';
  static readonly CODE_EXPIRED_CODE = 'ExpiredCodeException';
  static readonly CODE_LIMIT_EXCEEDED = 'LimitExceededException';
  static readonly CODE_INTERNAL_ERROR = 'InternalError';
  static readonly CODE_UNKNOWN = 'UnknownError';

  constructor(message: string, code: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export interface DocIntelligenceInterface {
  /**
   * Analyzes a document image and returns the layout data
   * @param image - The base64 encoded image data
   * @param fileName - The name of the file, including the file extension (for image type detection)
   * @param progressCallback - A callback function to report the progress of the analysis
   * @returns The layout data of the document
   */
  analyzeImage: (
    imageData: string,
    fileName: string,
    progressCallback?: (progress: number) => void
  ) => Promise<DocumentTextDetectionData | null>;

  /**
   * Analyzes a document file and returns the layout data
   */
  analyzePDF: (
    fileName: string,
    progressCallback?: (progress: number) => void
  ) => Promise<Array<DocumentTextDetectionData>>;
}

export class DocIntelligenceError extends Error {
  public code: string;
  static readonly CODE_INSUFFICIENT_BALANCE = 'InsufficientBalance';
  static readonly CODE_AUTH_REQUIRED = 'AuthRequired';
  static readonly CODE_UNKNOWN = 'UnknownError';

  constructor(message: string, code: string) {
    super(message);
    this.name = 'DocIntelligenceError';
    this.code = code;
  }
}
