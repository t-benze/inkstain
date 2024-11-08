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
 * @interface DocumentTag
 */
export interface DocumentTag {
  /**
   *
   * @type {string}
   * @memberof DocumentTag
   */
  id: string;
  /**
   *
   * @type {string}
   * @memberof DocumentTag
   */
  name: string;
}

/**
 * Check if a given object implements the DocumentTag interface.
 */
export function instanceOfDocumentTag(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'id' in value;
  isInstance = isInstance && 'name' in value;

  return isInstance;
}

export function DocumentTagFromJSON(json: any): DocumentTag {
  return DocumentTagFromJSONTyped(json, false);
}

export function DocumentTagFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): DocumentTag {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    id: json['id'],
    name: json['name'],
  };
}

export function DocumentTagToJSON(value?: DocumentTag | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
  };
}
