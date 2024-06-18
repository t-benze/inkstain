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
 * @interface DocumentSearchResultMetaAttributes
 */
export interface DocumentSearchResultMetaAttributes {
  /**
   *
   * @type {string}
   * @memberof DocumentSearchResultMetaAttributes
   */
  title: string;
  /**
   *
   * @type {Array<string>}
   * @memberof DocumentSearchResultMetaAttributes
   */
  author: Array<string>;
}

/**
 * Check if a given object implements the DocumentSearchResultMetaAttributes interface.
 */
export function instanceOfDocumentSearchResultMetaAttributes(
  value: object
): boolean {
  let isInstance = true;
  isInstance = isInstance && 'title' in value;
  isInstance = isInstance && 'author' in value;

  return isInstance;
}

export function DocumentSearchResultMetaAttributesFromJSON(
  json: any
): DocumentSearchResultMetaAttributes {
  return DocumentSearchResultMetaAttributesFromJSONTyped(json, false);
}

export function DocumentSearchResultMetaAttributesFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): DocumentSearchResultMetaAttributes {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    title: json['title'],
    author: json['author'],
  };
}

export function DocumentSearchResultMetaAttributesToJSON(
  value?: DocumentSearchResultMetaAttributes | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    title: value.title,
    author: value.author,
  };
}