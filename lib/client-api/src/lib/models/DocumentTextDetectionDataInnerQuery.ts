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
/**
 *
 * @export
 * @interface DocumentTextDetectionDataInnerQuery
 */
export interface DocumentTextDetectionDataInnerQuery {
  /**
   *
   * @type {string}
   * @memberof DocumentTextDetectionDataInnerQuery
   */
  alias?: string;
  /**
   *
   * @type {Array<string>}
   * @memberof DocumentTextDetectionDataInnerQuery
   */
  pages?: Array<string>;
  /**
   *
   * @type {string}
   * @memberof DocumentTextDetectionDataInnerQuery
   */
  text?: string;
}

/**
 * Check if a given object implements the DocumentTextDetectionDataInnerQuery interface.
 */
export function instanceOfDocumentTextDetectionDataInnerQuery(
  value: object
): boolean {
  let isInstance = true;

  return isInstance;
}

export function DocumentTextDetectionDataInnerQueryFromJSON(
  json: any
): DocumentTextDetectionDataInnerQuery {
  return DocumentTextDetectionDataInnerQueryFromJSONTyped(json, false);
}

export function DocumentTextDetectionDataInnerQueryFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): DocumentTextDetectionDataInnerQuery {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    alias: !exists(json, 'Alias') ? undefined : json['Alias'],
    pages: !exists(json, 'Pages') ? undefined : json['Pages'],
    text: !exists(json, 'Text') ? undefined : json['Text'],
  };
}

export function DocumentTextDetectionDataInnerQueryToJSON(
  value?: DocumentTextDetectionDataInnerQuery | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    Alias: value.alias,
    Pages: value.pages,
    Text: value.text,
  };
}