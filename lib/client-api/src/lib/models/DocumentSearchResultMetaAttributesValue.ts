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
 * @interface DocumentSearchResultMetaAttributesValue
 */
export interface DocumentSearchResultMetaAttributesValue {}

/**
 * Check if a given object implements the DocumentSearchResultMetaAttributesValue interface.
 */
export function instanceOfDocumentSearchResultMetaAttributesValue(
  value: object
): boolean {
  let isInstance = true;

  return isInstance;
}

export function DocumentSearchResultMetaAttributesValueFromJSON(
  json: any
): DocumentSearchResultMetaAttributesValue {
  return DocumentSearchResultMetaAttributesValueFromJSONTyped(json, false);
}

export function DocumentSearchResultMetaAttributesValueFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): DocumentSearchResultMetaAttributesValue {
  return json;
}

export function DocumentSearchResultMetaAttributesValueToJSON(
  value?: DocumentSearchResultMetaAttributesValue | null
): any {
  return value;
}