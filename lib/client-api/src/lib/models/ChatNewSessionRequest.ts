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
 * @interface ChatNewSessionRequest
 */
export interface ChatNewSessionRequest {
  /**
   * The user message
   * @type {string}
   * @memberof ChatNewSessionRequest
   */
  message: string;
}

/**
 * Check if a given object implements the ChatNewSessionRequest interface.
 */
export function instanceOfChatNewSessionRequest(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'message' in value;

  return isInstance;
}

export function ChatNewSessionRequestFromJSON(
  json: any
): ChatNewSessionRequest {
  return ChatNewSessionRequestFromJSONTyped(json, false);
}

export function ChatNewSessionRequestFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): ChatNewSessionRequest {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    message: json['message'],
  };
}

export function ChatNewSessionRequestToJSON(
  value?: ChatNewSessionRequest | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    message: value.message,
  };
}