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
import type { SearchDocuments200Response } from '../models/index';
import {
  SearchDocuments200ResponseFromJSON,
  SearchDocuments200ResponseToJSON,
} from '../models/index';

export interface SearchDocumentsRequest {
  spaceKey: string;
  tagFilter?: Array<string>;
  attributeFilters?: string;
  offset?: number;
  limit?: number;
}

/**
 *
 */
export class SearchApi extends runtime.BaseAPI {
  /**
   * Search documents in a specific space
   */
  async searchDocumentsRaw(
    requestParameters: SearchDocumentsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<SearchDocuments200Response>> {
    if (
      requestParameters.spaceKey === null ||
      requestParameters.spaceKey === undefined
    ) {
      throw new runtime.RequiredError(
        'spaceKey',
        'Required parameter requestParameters.spaceKey was null or undefined when calling searchDocuments.'
      );
    }

    const queryParameters: any = {};

    if (requestParameters.tagFilter) {
      queryParameters['tagFilter'] = requestParameters.tagFilter;
    }

    if (requestParameters.attributeFilters !== undefined) {
      queryParameters['attributeFilters'] = requestParameters.attributeFilters;
    }

    if (requestParameters.offset !== undefined) {
      queryParameters['offset'] = requestParameters.offset;
    }

    if (requestParameters.limit !== undefined) {
      queryParameters['limit'] = requestParameters.limit;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/search/{spaceKey}/documents`.replace(
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
      SearchDocuments200ResponseFromJSON(jsonValue)
    );
  }

  /**
   * Search documents in a specific space
   */
  async searchDocuments(
    requestParameters: SearchDocumentsRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<SearchDocuments200Response> {
    const response = await this.searchDocumentsRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }
}
