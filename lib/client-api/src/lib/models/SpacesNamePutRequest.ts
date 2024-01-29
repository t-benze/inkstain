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
 * @interface SpacesNamePutRequest
 */
export interface SpacesNamePutRequest {
  /**
   * New name for the space
   * @type {string}
   * @memberof SpacesNamePutRequest
   */
  newName: string;
}

/**
 * Check if a given object implements the SpacesNamePutRequest interface.
 */
export function instanceOfSpacesNamePutRequest(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'newName' in value;

  return isInstance;
}

export function SpacesNamePutRequestFromJSON(json: any): SpacesNamePutRequest {
  return SpacesNamePutRequestFromJSONTyped(json, false);
}

export function SpacesNamePutRequestFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): SpacesNamePutRequest {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    newName: json['newName'],
  };
}

export function SpacesNamePutRequestToJSON(
  value?: SpacesNamePutRequest | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    newName: value.newName,
  };
}
