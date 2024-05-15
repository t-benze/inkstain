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
 * @interface PlatformInfo200Response
 */
export interface PlatformInfo200Response {
  /**
   * The platform of the server.
   * @type {string}
   * @memberof PlatformInfo200Response
   */
  platform: string;
  /**
   * The home directory of the server.
   * @type {string}
   * @memberof PlatformInfo200Response
   */
  homedir: string;
  /**
   * The path separator of the server.
   * @type {string}
   * @memberof PlatformInfo200Response
   */
  pathSep: string;
  /**
   *
   * @type {Array<string>}
   * @memberof PlatformInfo200Response
   */
  drives?: Array<string>;
}

/**
 * Check if a given object implements the PlatformInfo200Response interface.
 */
export function instanceOfPlatformInfo200Response(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && 'platform' in value;
  isInstance = isInstance && 'homedir' in value;
  isInstance = isInstance && 'pathSep' in value;

  return isInstance;
}

export function PlatformInfo200ResponseFromJSON(
  json: any
): PlatformInfo200Response {
  return PlatformInfo200ResponseFromJSONTyped(json, false);
}

export function PlatformInfo200ResponseFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): PlatformInfo200Response {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    platform: json['platform'],
    homedir: json['homedir'],
    pathSep: json['pathSep'],
    drives: !exists(json, 'drives') ? undefined : json['drives'],
  };
}

export function PlatformInfo200ResponseToJSON(
  value?: PlatformInfo200Response | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    platform: value.platform,
    homedir: value.homedir,
    pathSep: value.pathSep,
    drives: value.drives,
  };
}