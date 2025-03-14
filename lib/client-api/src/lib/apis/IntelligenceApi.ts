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
  DocumentTextContent,
  ErrorResponseData,
  IntelligenceAnalyzeDocument200Response,
  IntelligenceAnalyzeDocumentRequest,
  IntelligenceDocLayout200Response,
  IntelligenceDocLayoutStatus200Response,
} from '../models/index';
import {
  DocumentTextContentFromJSON,
  DocumentTextContentToJSON,
  ErrorResponseDataFromJSON,
  ErrorResponseDataToJSON,
  IntelligenceAnalyzeDocument200ResponseFromJSON,
  IntelligenceAnalyzeDocument200ResponseToJSON,
  IntelligenceAnalyzeDocumentRequestFromJSON,
  IntelligenceAnalyzeDocumentRequestToJSON,
  IntelligenceDocLayout200ResponseFromJSON,
  IntelligenceDocLayout200ResponseToJSON,
  IntelligenceDocLayoutStatus200ResponseFromJSON,
  IntelligenceDocLayoutStatus200ResponseToJSON,
} from '../models/index';

export interface IntelligenceAnalyzeDocumentOperationRequest {
  spaceKey: string;
  intelligenceAnalyzeDocumentRequest: IntelligenceAnalyzeDocumentRequest;
}

export interface IntelligenceDocLayoutRequest {
  spaceKey: string;
  path: string;
  pageNum: number;
}

export interface IntelligenceDocLayoutStatusRequest {
  spaceKey: string;
  path: string;
}

export interface IntelligenceDocTextContentRequest {
  spaceKey: string;
  path: string;
}

export interface IntelligenceWebclipDocumentRequest {
  spaceKey: string;
  intelligenceAnalyzeDocumentRequest: IntelligenceAnalyzeDocumentRequest;
}

/**
 *
 */
export class IntelligenceApi extends runtime.BaseAPI {
  /**
   * analyze doucment through intelligence service
   */
  async intelligenceAnalyzeDocumentRaw(
    requestParameters: IntelligenceAnalyzeDocumentOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<IntelligenceAnalyzeDocument200Response>> {
    if (
      requestParameters.spaceKey === null ||
      requestParameters.spaceKey === undefined
    ) {
      throw new runtime.RequiredError(
        'spaceKey',
        'Required parameter requestParameters.spaceKey was null or undefined when calling intelligenceAnalyzeDocument.'
      );
    }

    if (
      requestParameters.intelligenceAnalyzeDocumentRequest === null ||
      requestParameters.intelligenceAnalyzeDocumentRequest === undefined
    ) {
      throw new runtime.RequiredError(
        'intelligenceAnalyzeDocumentRequest',
        'Required parameter requestParameters.intelligenceAnalyzeDocumentRequest was null or undefined when calling intelligenceAnalyzeDocument.'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/intelligence/{spaceKey}/analyze`.replace(
          `{${'spaceKey'}}`,
          encodeURIComponent(String(requestParameters.spaceKey))
        ),
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: IntelligenceAnalyzeDocumentRequestToJSON(
          requestParameters.intelligenceAnalyzeDocumentRequest
        ),
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      IntelligenceAnalyzeDocument200ResponseFromJSON(jsonValue)
    );
  }

  /**
   * analyze doucment through intelligence service
   */
  async intelligenceAnalyzeDocument(
    requestParameters: IntelligenceAnalyzeDocumentOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<IntelligenceAnalyzeDocument200Response> {
    const response = await this.intelligenceAnalyzeDocumentRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }

  /**
   * get the document layout of a specified document page
   */
  async intelligenceDocLayoutRaw(
    requestParameters: IntelligenceDocLayoutRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<IntelligenceDocLayout200Response>> {
    if (
      requestParameters.spaceKey === null ||
      requestParameters.spaceKey === undefined
    ) {
      throw new runtime.RequiredError(
        'spaceKey',
        'Required parameter requestParameters.spaceKey was null or undefined when calling intelligenceDocLayout.'
      );
    }

    if (
      requestParameters.path === null ||
      requestParameters.path === undefined
    ) {
      throw new runtime.RequiredError(
        'path',
        'Required parameter requestParameters.path was null or undefined when calling intelligenceDocLayout.'
      );
    }

    if (
      requestParameters.pageNum === null ||
      requestParameters.pageNum === undefined
    ) {
      throw new runtime.RequiredError(
        'pageNum',
        'Required parameter requestParameters.pageNum was null or undefined when calling intelligenceDocLayout.'
      );
    }

    const queryParameters: any = {};

    if (requestParameters.path !== undefined) {
      queryParameters['path'] = requestParameters.path;
    }

    if (requestParameters.pageNum !== undefined) {
      queryParameters['pageNum'] = requestParameters.pageNum;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/intelligence/{spaceKey}/layout`.replace(
          `{${'spaceKey'}}`,
          encodeURIComponent(String(requestParameters.spaceKey))
        ),
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      IntelligenceDocLayout200ResponseFromJSON(jsonValue)
    );
  }

  /**
   * get the document layout of a specified document page
   */
  async intelligenceDocLayout(
    requestParameters: IntelligenceDocLayoutRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<IntelligenceDocLayout200Response> {
    const response = await this.intelligenceDocLayoutRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }

  /**
   * get the document layout status of a specified document
   */
  async intelligenceDocLayoutStatusRaw(
    requestParameters: IntelligenceDocLayoutStatusRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<IntelligenceDocLayoutStatus200Response>> {
    if (
      requestParameters.spaceKey === null ||
      requestParameters.spaceKey === undefined
    ) {
      throw new runtime.RequiredError(
        'spaceKey',
        'Required parameter requestParameters.spaceKey was null or undefined when calling intelligenceDocLayoutStatus.'
      );
    }

    if (
      requestParameters.path === null ||
      requestParameters.path === undefined
    ) {
      throw new runtime.RequiredError(
        'path',
        'Required parameter requestParameters.path was null or undefined when calling intelligenceDocLayoutStatus.'
      );
    }

    const queryParameters: any = {};

    if (requestParameters.path !== undefined) {
      queryParameters['path'] = requestParameters.path;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/intelligence/{spaceKey}/layout-status`.replace(
          `{${'spaceKey'}}`,
          encodeURIComponent(String(requestParameters.spaceKey))
        ),
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      IntelligenceDocLayoutStatus200ResponseFromJSON(jsonValue)
    );
  }

  /**
   * get the document layout status of a specified document
   */
  async intelligenceDocLayoutStatus(
    requestParameters: IntelligenceDocLayoutStatusRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<IntelligenceDocLayoutStatus200Response> {
    const response = await this.intelligenceDocLayoutStatusRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }

  /**
   * Get the text content of a document
   */
  async intelligenceDocTextContentRaw(
    requestParameters: IntelligenceDocTextContentRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<DocumentTextContent>> {
    if (
      requestParameters.spaceKey === null ||
      requestParameters.spaceKey === undefined
    ) {
      throw new runtime.RequiredError(
        'spaceKey',
        'Required parameter requestParameters.spaceKey was null or undefined when calling intelligenceDocTextContent.'
      );
    }

    if (
      requestParameters.path === null ||
      requestParameters.path === undefined
    ) {
      throw new runtime.RequiredError(
        'path',
        'Required parameter requestParameters.path was null or undefined when calling intelligenceDocTextContent.'
      );
    }

    const queryParameters: any = {};

    if (requestParameters.path !== undefined) {
      queryParameters['path'] = requestParameters.path;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/intelligence/{spaceKey}/text-content`.replace(
          `{${'spaceKey'}}`,
          encodeURIComponent(String(requestParameters.spaceKey))
        ),
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      DocumentTextContentFromJSON(jsonValue)
    );
  }

  /**
   * Get the text content of a document
   */
  async intelligenceDocTextContent(
    requestParameters: IntelligenceDocTextContentRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<DocumentTextContent> {
    const response = await this.intelligenceDocTextContentRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }

  /**
   * analyze webclip doucment through intelligence service
   */
  async intelligenceWebclipDocumentRaw(
    requestParameters: IntelligenceWebclipDocumentRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<IntelligenceAnalyzeDocument200Response>> {
    if (
      requestParameters.spaceKey === null ||
      requestParameters.spaceKey === undefined
    ) {
      throw new runtime.RequiredError(
        'spaceKey',
        'Required parameter requestParameters.spaceKey was null or undefined when calling intelligenceWebclipDocument.'
      );
    }

    if (
      requestParameters.intelligenceAnalyzeDocumentRequest === null ||
      requestParameters.intelligenceAnalyzeDocumentRequest === undefined
    ) {
      throw new runtime.RequiredError(
        'intelligenceAnalyzeDocumentRequest',
        'Required parameter requestParameters.intelligenceAnalyzeDocumentRequest was null or undefined when calling intelligenceWebclipDocument.'
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/intelligence/{spaceKey}/webclip`.replace(
          `{${'spaceKey'}}`,
          encodeURIComponent(String(requestParameters.spaceKey))
        ),
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: IntelligenceAnalyzeDocumentRequestToJSON(
          requestParameters.intelligenceAnalyzeDocumentRequest
        ),
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      IntelligenceAnalyzeDocument200ResponseFromJSON(jsonValue)
    );
  }

  /**
   * analyze webclip doucment through intelligence service
   */
  async intelligenceWebclipDocument(
    requestParameters: IntelligenceWebclipDocumentRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<IntelligenceAnalyzeDocument200Response> {
    const response = await this.intelligenceWebclipDocumentRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }
}
