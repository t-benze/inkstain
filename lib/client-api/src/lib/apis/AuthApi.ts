/* tslint:disable */
/* eslint-disable */
/**
 * InkStain
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import * as runtime from '../runtime';
import type {
  ConfirmForgotPasswordRequest,
  ConfirmSignUpRequest,
  ForgotPasswordRequest,
  SignInRequest,
  SignUpRequest,
  UserInfo,
} from '../models/index';
import {
  ConfirmForgotPasswordRequestFromJSON,
  ConfirmForgotPasswordRequestToJSON,
  ConfirmSignUpRequestFromJSON,
  ConfirmSignUpRequestToJSON,
  ForgotPasswordRequestFromJSON,
  ForgotPasswordRequestToJSON,
  SignInRequestFromJSON,
  SignInRequestToJSON,
  SignUpRequestFromJSON,
  SignUpRequestToJSON,
  UserInfoFromJSON,
  UserInfoToJSON,
} from '../models/index';

export interface ConfirmForgotPasswordOperationRequest {
  confirmForgotPasswordRequest: ConfirmForgotPasswordRequest;
}

export interface ConfirmSignUpOperationRequest {
  confirmSignUpRequest: ConfirmSignUpRequest;
}

export interface ForgotPasswordOperationRequest {
  forgotPasswordRequest: ForgotPasswordRequest;
}

export interface SignInOperationRequest {
  signInRequest: SignInRequest;
}

export interface SignUpOperationRequest {
  signUpRequest: SignUpRequest;
}

/**
 *
 */
export class AuthApi extends runtime.BaseAPI {
  /**
   * Confirm forgot password
   */
  async confirmForgotPasswordRaw(
    requestParameters: ConfirmForgotPasswordOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (
      requestParameters.confirmForgotPasswordRequest === null ||
      requestParameters.confirmForgotPasswordRequest === undefined
    ) {
      throw new runtime.RequiredError(
        'confirmForgotPasswordRequest',
        'Required parameter requestParameters.confirmForgotPasswordRequest was null or undefined when calling confirmForgotPassword.'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/auth/confirm-forgot-password`,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: ConfirmForgotPasswordRequestToJSON(
          requestParameters.confirmForgotPasswordRequest
        ),
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Confirm forgot password
   */
  async confirmForgotPassword(
    requestParameters: ConfirmForgotPasswordOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.confirmForgotPasswordRaw(requestParameters, initOverrides);
  }

  /**
   * Confirm user signup
   */
  async confirmSignUpRaw(
    requestParameters: ConfirmSignUpOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (
      requestParameters.confirmSignUpRequest === null ||
      requestParameters.confirmSignUpRequest === undefined
    ) {
      throw new runtime.RequiredError(
        'confirmSignUpRequest',
        'Required parameter requestParameters.confirmSignUpRequest was null or undefined when calling confirmSignUp.'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/auth/confirm-signup`,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: ConfirmSignUpRequestToJSON(
          requestParameters.confirmSignUpRequest
        ),
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Confirm user signup
   */
  async confirmSignUp(
    requestParameters: ConfirmSignUpOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.confirmSignUpRaw(requestParameters, initOverrides);
  }

  /**
   * Initiate forgot password process
   */
  async forgotPasswordRaw(
    requestParameters: ForgotPasswordOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (
      requestParameters.forgotPasswordRequest === null ||
      requestParameters.forgotPasswordRequest === undefined
    ) {
      throw new runtime.RequiredError(
        'forgotPasswordRequest',
        'Required parameter requestParameters.forgotPasswordRequest was null or undefined when calling forgotPassword.'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/auth/forgot-password`,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: ForgotPasswordRequestToJSON(
          requestParameters.forgotPasswordRequest
        ),
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Initiate forgot password process
   */
  async forgotPassword(
    requestParameters: ForgotPasswordOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.forgotPasswordRaw(requestParameters, initOverrides);
  }

  /**
   * Sign in a user
   */
  async signInRaw(
    requestParameters: SignInOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (
      requestParameters.signInRequest === null ||
      requestParameters.signInRequest === undefined
    ) {
      throw new runtime.RequiredError(
        'signInRequest',
        'Required parameter requestParameters.signInRequest was null or undefined when calling signIn.'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/auth/signin`,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: SignInRequestToJSON(requestParameters.signInRequest),
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Sign in a user
   */
  async signIn(
    requestParameters: SignInOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.signInRaw(requestParameters, initOverrides);
  }

  /**
   * Sign out a user
   */
  async signOutRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/auth/signout`,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Sign out a user
   */
  async signOut(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.signOutRaw(initOverrides);
  }

  /**
   * Sign up a new user
   */
  async signUpRaw(
    requestParameters: SignUpOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (
      requestParameters.signUpRequest === null ||
      requestParameters.signUpRequest === undefined
    ) {
      throw new runtime.RequiredError(
        'signUpRequest',
        'Required parameter requestParameters.signUpRequest was null or undefined when calling signUp.'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/auth/signup`,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: SignUpRequestToJSON(requestParameters.signUpRequest),
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Sign up a new user
   */
  async signUp(
    requestParameters: SignUpOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.signUpRaw(requestParameters, initOverrides);
  }

  /**
   * Get authentication status
   */
  async userInfoRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<UserInfo>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/auth/user`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      UserInfoFromJSON(jsonValue)
    );
  }

  /**
   * Get authentication status
   */
  async userInfo(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<UserInfo> {
    const response = await this.userInfoRaw(initOverrides);
    return await response.value();
  }
}
