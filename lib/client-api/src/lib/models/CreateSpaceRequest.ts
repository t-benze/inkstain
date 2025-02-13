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
 * @interface CreateSpaceRequest
 */
export interface CreateSpaceRequest {
  /**
   * Name of the space.
   * @type {string}
   * @memberof CreateSpaceRequest
   */
  name?: string;
  /**
   * Key of the space.
   * @type {string}
   * @memberof CreateSpaceRequest
   */
  path: string;
}

/**
 * Check if a given object implements the CreateSpaceRequest interface.
 */
export function instanceOfCreateSpaceRequest(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'path' in value;

  return isInstance;
}

export function CreateSpaceRequestFromJSON(json: any): CreateSpaceRequest {
  return CreateSpaceRequestFromJSONTyped(json, false);
}

export function CreateSpaceRequestFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): CreateSpaceRequest {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    name: !exists(json, 'name') ? undefined : json['name'],
    path: json['path'],
  };
}

export function CreateSpaceRequestToJSON(
  value?: CreateSpaceRequest | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    name: value.name,
    path: value.path,
  };
}
