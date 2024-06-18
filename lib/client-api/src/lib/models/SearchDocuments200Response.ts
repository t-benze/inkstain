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

import { exists, mapValues } from '../runtime';
import type { DocumentSearchResult } from './DocumentSearchResult';
import {
  DocumentSearchResultFromJSON,
  DocumentSearchResultFromJSONTyped,
  DocumentSearchResultToJSON,
} from './DocumentSearchResult';

/**
 *
 * @export
 * @interface SearchDocuments200Response
 */
export interface SearchDocuments200Response {
  /**
   * List of system attributes
   * @type {Array<string>}
   * @memberof SearchDocuments200Response
   */
  systemAttributes: Array<string>;
  /**
   *
   * @type {Array<DocumentSearchResult>}
   * @memberof SearchDocuments200Response
   */
  data: Array<DocumentSearchResult>;
}

/**
 * Check if a given object implements the SearchDocuments200Response interface.
 */
export function instanceOfSearchDocuments200Response(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'systemAttributes' in value;
  isInstance = isInstance && 'data' in value;

  return isInstance;
}

export function SearchDocuments200ResponseFromJSON(
  json: any
): SearchDocuments200Response {
  return SearchDocuments200ResponseFromJSONTyped(json, false);
}

export function SearchDocuments200ResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): SearchDocuments200Response {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    systemAttributes: json['systemAttributes'],
    data: (json['data'] as Array<any>).map(DocumentSearchResultFromJSON),
  };
}

export function SearchDocuments200ResponseToJSON(
  value?: SearchDocuments200Response | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    systemAttributes: value.systemAttributes,
    data: (value.data as Array<any>).map(DocumentSearchResultToJSON),
  };
}