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
 * @interface AddUpdateDocumentAttributesRequest
 */
export interface AddUpdateDocumentAttributesRequest {
  /**
   * Attributes to add or update.
   * @type {object}
   * @memberof AddUpdateDocumentAttributesRequest
   */
  attributes?: object;
}

/**
 * Check if a given object implements the AddUpdateDocumentAttributesRequest interface.
 */
export function instanceOfAddUpdateDocumentAttributesRequest(
  value: object
): boolean {
  let isInstance = true;

  return isInstance;
}

export function AddUpdateDocumentAttributesRequestFromJSON(
  json: any
): AddUpdateDocumentAttributesRequest {
  return AddUpdateDocumentAttributesRequestFromJSONTyped(json, false);
}

export function AddUpdateDocumentAttributesRequestFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): AddUpdateDocumentAttributesRequest {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    attributes: !exists(json, 'attributes') ? undefined : json['attributes'],
  };
}

export function AddUpdateDocumentAttributesRequestToJSON(
  value?: AddUpdateDocumentAttributesRequest | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    attributes: value.attributes,
  };
}
