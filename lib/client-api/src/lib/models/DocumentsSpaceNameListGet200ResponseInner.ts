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
 * @interface DocumentsSpaceNameListGet200ResponseInner
 */
export interface DocumentsSpaceNameListGet200ResponseInner {
  /**
   * The name of the file or folder.
   * @type {string}
   * @memberof DocumentsSpaceNameListGet200ResponseInner
   */
  name: string;
  /**
   * The type of the item (file or folder).
   * @type {string}
   * @memberof DocumentsSpaceNameListGet200ResponseInner
   */
  type: DocumentsSpaceNameListGet200ResponseInnerTypeEnum;
  /**
   * The full path of the file or folder.
   * @type {string}
   * @memberof DocumentsSpaceNameListGet200ResponseInner
   */
  path: string;
  /**
   * The absolute path of the file or folder.
   * @type {string}
   * @memberof DocumentsSpaceNameListGet200ResponseInner
   */
  absolutePath: string;
}

/**
 * @export
 */
export const DocumentsSpaceNameListGet200ResponseInnerTypeEnum = {
  File: 'file',
  Folder: 'folder',
} as const;
export type DocumentsSpaceNameListGet200ResponseInnerTypeEnum =
  (typeof DocumentsSpaceNameListGet200ResponseInnerTypeEnum)[keyof typeof DocumentsSpaceNameListGet200ResponseInnerTypeEnum];

/**
 * Check if a given object implements the DocumentsSpaceNameListGet200ResponseInner interface.
 */
export function instanceOfDocumentsSpaceNameListGet200ResponseInner(
  value: object
): boolean {
  let isInstance = true;
  isInstance = isInstance && 'name' in value;
  isInstance = isInstance && 'type' in value;
  isInstance = isInstance && 'path' in value;
  isInstance = isInstance && 'absolutePath' in value;

  return isInstance;
}

export function DocumentsSpaceNameListGet200ResponseInnerFromJSON(
  json: any
): DocumentsSpaceNameListGet200ResponseInner {
  return DocumentsSpaceNameListGet200ResponseInnerFromJSONTyped(json, false);
}

export function DocumentsSpaceNameListGet200ResponseInnerFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): DocumentsSpaceNameListGet200ResponseInner {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    name: json['name'],
    type: json['type'],
    path: json['path'],
    absolutePath: json['absolutePath'],
  };
}

export function DocumentsSpaceNameListGet200ResponseInnerToJSON(
  value?: DocumentsSpaceNameListGet200ResponseInner | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    name: value.name,
    type: value.type,
    path: value.path,
    absolutePath: value.absolutePath,
  };
}
