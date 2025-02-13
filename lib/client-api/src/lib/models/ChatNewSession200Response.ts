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
import type { ChatMessage } from './ChatMessage';
import {
  ChatMessageFromJSON,
  ChatMessageFromJSONTyped,
  ChatMessageToJSON,
} from './ChatMessage';

/**
 *
 * @export
 * @interface ChatNewSession200Response
 */
export interface ChatNewSession200Response {
  /**
   *
   * @type {string}
   * @memberof ChatNewSession200Response
   */
  sessionId: string;
  /**
   *
   * @type {ChatMessage}
   * @memberof ChatNewSession200Response
   */
  data: ChatMessage;
}

/**
 * Check if a given object implements the ChatNewSession200Response interface.
 */
export function instanceOfChatNewSession200Response(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'sessionId' in value;
  isInstance = isInstance && 'data' in value;

  return isInstance;
}

export function ChatNewSession200ResponseFromJSON(
  json: any
): ChatNewSession200Response {
  return ChatNewSession200ResponseFromJSONTyped(json, false);
}

export function ChatNewSession200ResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): ChatNewSession200Response {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    sessionId: json['sessionId'],
    data: ChatMessageFromJSON(json['data']),
  };
}

export function ChatNewSession200ResponseToJSON(
  value?: ChatNewSession200Response | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    sessionId: value.sessionId,
    data: ChatMessageToJSON(value.data),
  };
}
