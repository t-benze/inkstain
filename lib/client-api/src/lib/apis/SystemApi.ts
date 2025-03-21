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
  ListDirectories200ResponseInner,
  PlatformInfo200Response,
  SaveSecretRequest,
  Settings,
  VerifyChatAPISettings200Response,
  VerifyChatAPISettingsRequest,
} from '../models/index';
import {
  ListDirectories200ResponseInnerFromJSON,
  ListDirectories200ResponseInnerToJSON,
  PlatformInfo200ResponseFromJSON,
  PlatformInfo200ResponseToJSON,
  SaveSecretRequestFromJSON,
  SaveSecretRequestToJSON,
  SettingsFromJSON,
  SettingsToJSON,
  VerifyChatAPISettings200ResponseFromJSON,
  VerifyChatAPISettings200ResponseToJSON,
  VerifyChatAPISettingsRequestFromJSON,
  VerifyChatAPISettingsRequestToJSON,
} from '../models/index';

export interface GetSecretsRequest {
  secretKey: Array<string>;
}

export interface ListDirectoriesRequest {
  path: string;
}

export interface SaveSecretOperationRequest {
  saveSecretRequest: SaveSecretRequest;
}

export interface UpdateSettingsRequest {
  settings: Settings;
}

export interface VerifyChatAPISettingsOperationRequest {
  verifyChatAPISettingsRequest: VerifyChatAPISettingsRequest;
}

/**
 *
 */
export class SystemApi extends runtime.BaseAPI {
  /**
   * Fetches the current secrets.
   * Get secrets
   */
  async getSecretsRaw(
    requestParameters: GetSecretsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<object>> {
    if (
      requestParameters.secretKey === null ||
      requestParameters.secretKey === undefined
    ) {
      throw new runtime.RequiredError(
        'secretKey',
        'Required parameter requestParameters.secretKey was null or undefined when calling getSecrets.'
      );
    }

    const queryParameters: any = {};

    if (requestParameters.secretKey) {
      queryParameters['secretKey'] = requestParameters.secretKey;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/system/secrets`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse<any>(response);
  }

  /**
   * Fetches the current secrets.
   * Get secrets
   */
  async getSecrets(
    requestParameters: GetSecretsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<object> {
    const response = await this.getSecretsRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Fetches the current system settings.
   * Retrieve system settings
   */
  async getSettingsRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<Settings>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/system/settings`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      SettingsFromJSON(jsonValue)
    );
  }

  /**
   * Fetches the current system settings.
   * Retrieve system settings
   */
  async getSettings(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<Settings> {
    const response = await this.getSettingsRaw(initOverrides);
    return await response.value();
  }

  /**
   * This endpoint returns a list of directories in the specified path.
   * List directories of a specified path
   */
  async listDirectoriesRaw(
    requestParameters: ListDirectoriesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<Array<ListDirectories200ResponseInner>>> {
    if (
      requestParameters.path === null ||
      requestParameters.path === undefined
    ) {
      throw new runtime.RequiredError(
        'path',
        'Required parameter requestParameters.path was null or undefined when calling listDirectories.'
      );
    }

    const queryParameters: any = {};

    if (requestParameters.path !== undefined) {
      queryParameters['path'] = requestParameters.path;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/system/directories`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      jsonValue.map(ListDirectories200ResponseInnerFromJSON)
    );
  }

  /**
   * This endpoint returns a list of directories in the specified path.
   * List directories of a specified path
   */
  async listDirectories(
    requestParameters: ListDirectoriesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<Array<ListDirectories200ResponseInner>> {
    const response = await this.listDirectoriesRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }

  /**
   * This endpoint returns the platform and home directory information of the server.
   * Get platform information
   */
  async platformInfoRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<PlatformInfo200Response>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/system/platform`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      PlatformInfo200ResponseFromJSON(jsonValue)
    );
  }

  /**
   * This endpoint returns the platform and home directory information of the server.
   * Get platform information
   */
  async platformInfo(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<PlatformInfo200Response> {
    const response = await this.platformInfoRaw(initOverrides);
    return await response.value();
  }

  /**
   * Stores a secret key-value pair.
   * Save a secret
   */
  async saveSecretRaw(
    requestParameters: SaveSecretOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (
      requestParameters.saveSecretRequest === null ||
      requestParameters.saveSecretRequest === undefined
    ) {
      throw new runtime.RequiredError(
        'saveSecretRequest',
        'Required parameter requestParameters.saveSecretRequest was null or undefined when calling saveSecret.'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/system/secrets`,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: SaveSecretRequestToJSON(requestParameters.saveSecretRequest),
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Stores a secret key-value pair.
   * Save a secret
   */
  async saveSecret(
    requestParameters: SaveSecretOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.saveSecretRaw(requestParameters, initOverrides);
  }

  /**
   * Updates the system settings with the provided values.
   * Update system settings
   */
  async updateSettingsRaw(
    requestParameters: UpdateSettingsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<Settings>> {
    if (
      requestParameters.settings === null ||
      requestParameters.settings === undefined
    ) {
      throw new runtime.RequiredError(
        'settings',
        'Required parameter requestParameters.settings was null or undefined when calling updateSettings.'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/system/settings`,
        method: 'PUT',
        headers: headerParameters,
        query: queryParameters,
        body: SettingsToJSON(requestParameters.settings),
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      SettingsFromJSON(jsonValue)
    );
  }

  /**
   * Updates the system settings with the provided values.
   * Update system settings
   */
  async updateSettings(
    requestParameters: UpdateSettingsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<Settings> {
    const response = await this.updateSettingsRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }

  /**
   * Verifies the chat API settings
   */
  async verifyChatAPISettingsRaw(
    requestParameters: VerifyChatAPISettingsOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<VerifyChatAPISettings200Response>> {
    if (
      requestParameters.verifyChatAPISettingsRequest === null ||
      requestParameters.verifyChatAPISettingsRequest === undefined
    ) {
      throw new runtime.RequiredError(
        'verifyChatAPISettingsRequest',
        'Required parameter requestParameters.verifyChatAPISettingsRequest was null or undefined when calling verifyChatAPISettings.'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/system/verify-chat-api-settings`,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: VerifyChatAPISettingsRequestToJSON(
          requestParameters.verifyChatAPISettingsRequest
        ),
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      VerifyChatAPISettings200ResponseFromJSON(jsonValue)
    );
  }

  /**
   * Verifies the chat API settings
   */
  async verifyChatAPISettings(
    requestParameters: VerifyChatAPISettingsOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<VerifyChatAPISettings200Response> {
    const response = await this.verifyChatAPISettingsRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }
}
