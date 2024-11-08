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
 * @interface IntelligenceDocLayoutStatus200Response
 */
export interface IntelligenceDocLayoutStatus200Response {
  /**
   * The status of the document layout
   * @type {string}
   * @memberof IntelligenceDocLayoutStatus200Response
   */
  status?: IntelligenceDocLayoutStatus200ResponseStatusEnum;
}

/**
 * @export
 */
export const IntelligenceDocLayoutStatus200ResponseStatusEnum = {
  Completed: 'completed',
  Partial: 'partial',
} as const;
export type IntelligenceDocLayoutStatus200ResponseStatusEnum =
  (typeof IntelligenceDocLayoutStatus200ResponseStatusEnum)[keyof typeof IntelligenceDocLayoutStatus200ResponseStatusEnum];

/**
 * Check if a given object implements the IntelligenceDocLayoutStatus200Response interface.
 */
export function instanceOfIntelligenceDocLayoutStatus200Response(
  value: object
): boolean {
  let isInstance = true;

  return isInstance;
}

export function IntelligenceDocLayoutStatus200ResponseFromJSON(
  json: any
): IntelligenceDocLayoutStatus200Response {
  return IntelligenceDocLayoutStatus200ResponseFromJSONTyped(json, false);
}

export function IntelligenceDocLayoutStatus200ResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): IntelligenceDocLayoutStatus200Response {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    status: !exists(json, 'status') ? undefined : json['status'],
  };
}

export function IntelligenceDocLayoutStatus200ResponseToJSON(
  value?: IntelligenceDocLayoutStatus200Response | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    status: value.status,
  };
}
