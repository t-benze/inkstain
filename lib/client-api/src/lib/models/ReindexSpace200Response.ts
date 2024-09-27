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
 * @interface ReindexSpace200Response
 */
export interface ReindexSpace200Response {
  /**
   * The ID of the task
   * @type {string}
   * @memberof ReindexSpace200Response
   */
  taskId: string;
}

/**
 * Check if a given object implements the ReindexSpace200Response interface.
 */
export function instanceOfReindexSpace200Response(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'taskId' in value;

  return isInstance;
}

export function ReindexSpace200ResponseFromJSON(
  json: any
): ReindexSpace200Response {
  return ReindexSpace200ResponseFromJSONTyped(json, false);
}

export function ReindexSpace200ResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): ReindexSpace200Response {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    taskId: json['taskId'],
  };
}

export function ReindexSpace200ResponseToJSON(
  value?: ReindexSpace200Response | null
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
