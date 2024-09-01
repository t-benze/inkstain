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
 * @interface BaseResponse
 */
export interface BaseResponse {
  /**
   *
   * @type {string}
   * @memberof BaseResponse
   */
  error?: string | null;
}

/**
 * Check if a given object implements the BaseResponse interface.
 */
export function instanceOfBaseResponse(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function BaseResponseFromJSON(json: any): BaseResponse {
  return BaseResponseFromJSONTyped(json, false);
}

export function BaseResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): BaseResponse {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    error: !exists(json, 'error') ? undefined : json['error'],
  };
}

export function BaseResponseToJSON(value?: BaseResponse | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    error: value.error,
  };
}
