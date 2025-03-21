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

/**
 *
 * @export
 */
export const ProxyRequestOperationEnum = {
  SignUp: 'signUp',
  ConfirmSignUp: 'confirmSignUp',
  SignIn: 'signIn',
  SignOut: 'signOut',
  ForgotPassword: 'forgotPassword',
  ConfirmForgotPassword: 'confirmForgotPassword',
  AuthStatus: 'authStatus',
} as const;
export type ProxyRequestOperationEnum =
  (typeof ProxyRequestOperationEnum)[keyof typeof ProxyRequestOperationEnum];

export function ProxyRequestOperationEnumFromJSON(
  json: any
): ProxyRequestOperationEnum {
  return ProxyRequestOperationEnumFromJSONTyped(json, false);
}

export function ProxyRequestOperationEnumFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): ProxyRequestOperationEnum {
  return json as ProxyRequestOperationEnum;
}

export function ProxyRequestOperationEnumToJSON(
  value?: ProxyRequestOperationEnum | null
): any {
  return value as any;
}
