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
 * @interface CreateSpace201Response
 */
export interface CreateSpace201Response {
  /**
   * Task ID for the space creation process. When presents, the space is being created in the background and the task ID can be used to track the progress.
   * @type {string}
   * @memberof CreateSpace201Response
   */
  taskId?: string;
}

/**
 * Check if a given object implements the CreateSpace201Response interface.
 */
export function instanceOfCreateSpace201Response(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function CreateSpace201ResponseFromJSON(
  json: any
): CreateSpace201Response {
  return CreateSpace201ResponseFromJSONTyped(json, false);
}

export function CreateSpace201ResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): CreateSpace201Response {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    taskId: !exists(json, 'taskId') ? undefined : json['taskId'],
  };
}

export function CreateSpace201ResponseToJSON(
  value?: CreateSpace201Response | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    taskId: value.taskId,
  };
}
