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
 * @interface PlatformInfo200ResponseAttributes
 */
export interface PlatformInfo200ResponseAttributes {
  /**
   *
   * @type {Array<string>}
   * @memberof PlatformInfo200ResponseAttributes
   */
  attributesWithIndex: Array<string>;
  /**
   *
   * @type {Array<string>}
   * @memberof PlatformInfo200ResponseAttributes
   */
  attributes: Array<string>;
}

/**
 * Check if a given object implements the PlatformInfo200ResponseAttributes interface.
 */
export function instanceOfPlatformInfo200ResponseAttributes(
  value: object
): boolean {
  let isInstance = true;
  isInstance = isInstance && 'attributesWithIndex' in value;
  isInstance = isInstance && 'attributes' in value;

  return isInstance;
}

export function PlatformInfo200ResponseAttributesFromJSON(
  json: any
): PlatformInfo200ResponseAttributes {
  return PlatformInfo200ResponseAttributesFromJSONTyped(json, false);
}

export function PlatformInfo200ResponseAttributesFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): PlatformInfo200ResponseAttributes {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    attributesWithIndex: json['attributesWithIndex'],
    attributes: json['attributes'],
  };
}

export function PlatformInfo200ResponseAttributesToJSON(
  value?: PlatformInfo200ResponseAttributes | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    attributesWithIndex: value.attributesWithIndex,
    attributes: value.attributes,
  };
}
