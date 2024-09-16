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
 * @interface ConfirmForgotPasswordRequest
 */
export interface ConfirmForgotPasswordRequest {
  /**
   *
   * @type {string}
   * @memberof ConfirmForgotPasswordRequest
   */
  username: string;
  /**
   *
   * @type {string}
   * @memberof ConfirmForgotPasswordRequest
   */
  code: string;
  /**
   *
   * @type {string}
   * @memberof ConfirmForgotPasswordRequest
   */
  newPassword: string;
}

/**
 * Check if a given object implements the ConfirmForgotPasswordRequest interface.
 */
export function instanceOfConfirmForgotPasswordRequest(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'username' in value;
  isInstance = isInstance && 'code' in value;
  isInstance = isInstance && 'newPassword' in value;

  return isInstance;
}

export function ConfirmForgotPasswordRequestFromJSON(
  json: any
): ConfirmForgotPasswordRequest {
  return ConfirmForgotPasswordRequestFromJSONTyped(json, false);
}

export function ConfirmForgotPasswordRequestFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): ConfirmForgotPasswordRequest {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    username: json['username'],
    code: json['code'],
    newPassword: json['newPassword'],
  };
}

export function ConfirmForgotPasswordRequestToJSON(
  value?: ConfirmForgotPasswordRequest | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    username: value.username,
    code: value.code,
    newPassword: value.newPassword,
  };
}