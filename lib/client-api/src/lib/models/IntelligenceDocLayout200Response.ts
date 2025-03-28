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
import type { DocumentTextDetectionData } from './DocumentTextDetectionData';
import {
  DocumentTextDetectionDataFromJSON,
  DocumentTextDetectionDataFromJSONTyped,
  DocumentTextDetectionDataToJSON,
} from './DocumentTextDetectionData';

/**
 *
 * @export
 * @interface IntelligenceDocLayout200Response
 */
export interface IntelligenceDocLayout200Response {
  /**
   *
   * @type {DocumentTextDetectionData}
   * @memberof IntelligenceDocLayout200Response
   */
  data?: DocumentTextDetectionData;
}

/**
 * Check if a given object implements the IntelligenceDocLayout200Response interface.
 */
export function instanceOfIntelligenceDocLayout200Response(
  value: object
): boolean {
  let isInstance = true;

  return isInstance;
}

export function IntelligenceDocLayout200ResponseFromJSON(
  json: any
): IntelligenceDocLayout200Response {
  return IntelligenceDocLayout200ResponseFromJSONTyped(json, false);
}

export function IntelligenceDocLayout200ResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): IntelligenceDocLayout200Response {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    data: !exists(json, 'data')
      ? undefined
      : DocumentTextDetectionDataFromJSON(json['data']),
  };
}

export function IntelligenceDocLayout200ResponseToJSON(
  value?: IntelligenceDocLayout200Response | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    data: DocumentTextDetectionDataToJSON(value.data),
  };
}
