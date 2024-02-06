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

import * as runtime from '../runtime';
import type { DocumentsSpaceNameListGet200ResponseInner } from '../models/index';
import {
  DocumentsSpaceNameListGet200ResponseInnerFromJSON,
  DocumentsSpaceNameListGet200ResponseInnerToJSON,
} from '../models/index';

export interface DocumentsSpaceNameAddFolderPostRequest {
  spaceName: string;
  path: string;
}

export interface DocumentsSpaceNameAddPostRequest {
  spaceName: string;
  path: string;
  document: Blob;
}

export interface DocumentsSpaceNameContentGetRequest {
  spaceName: string;
  path: string;
}

export interface DocumentsSpaceNameDeleteDeleteRequest {
  spaceName: string;
  path: string;
}

export interface DocumentsSpaceNameDeleteFolderDeleteRequest {
  spaceName: string;
  path: string;
}

export interface DocumentsSpaceNameListGetRequest {
  spaceName: string;
  path: string;
}

/**
 *
 */
export class DocumentsApi extends runtime.BaseAPI {
  /**
   * Add a new folder within a space
   */
  async documentsSpaceNameAddFolderPostRaw(
    requestParameters: DocumentsSpaceNameAddFolderPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (
      requestParameters.spaceName === null ||
      requestParameters.spaceName === undefined
    ) {
      throw new runtime.RequiredError(
        'spaceName',
        'Required parameter requestParameters.spaceName was null or undefined when calling documentsSpaceNameAddFolderPost.'
      );
    }

    if (
      requestParameters.path === null ||
      requestParameters.path === undefined
    ) {
      throw new runtime.RequiredError(
        'path',
        'Required parameter requestParameters.path was null or undefined when calling documentsSpaceNameAddFolderPost.'
      );
    }

    const queryParameters: any = {};

    if (requestParameters.path !== undefined) {
      queryParameters['path'] = requestParameters.path;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/documents/{spaceName}/addFolder`.replace(
          `{${'spaceName'}}`,
          encodeURIComponent(String(requestParameters.spaceName))
        ),
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Add a new folder within a space
   */
  async documentsSpaceNameAddFolderPost(
    requestParameters: DocumentsSpaceNameAddFolderPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.documentsSpaceNameAddFolderPostRaw(
      requestParameters,
      initOverrides
    );
  }

  /**
   * Add a new document to a space
   */
  async documentsSpaceNameAddPostRaw(
    requestParameters: DocumentsSpaceNameAddPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (
      requestParameters.spaceName === null ||
      requestParameters.spaceName === undefined
    ) {
      throw new runtime.RequiredError(
        'spaceName',
        'Required parameter requestParameters.spaceName was null or undefined when calling documentsSpaceNameAddPost.'
      );
    }

    if (
      requestParameters.path === null ||
      requestParameters.path === undefined
    ) {
      throw new runtime.RequiredError(
        'path',
        'Required parameter requestParameters.path was null or undefined when calling documentsSpaceNameAddPost.'
      );
    }

    if (
      requestParameters.document === null ||
      requestParameters.document === undefined
    ) {
      throw new runtime.RequiredError(
        'document',
        'Required parameter requestParameters.document was null or undefined when calling documentsSpaceNameAddPost.'
      );
    }

    const queryParameters: any = {};

    if (requestParameters.path !== undefined) {
      queryParameters['path'] = requestParameters.path;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const consumes: runtime.Consume[] = [
      { contentType: 'multipart/form-data' },
    ];
    // @ts-ignore: canConsumeForm may be unused
    const canConsumeForm = runtime.canConsumeForm(consumes);

    let formParams: { append(param: string, value: any): any };
    let useForm = false;
    // use FormData to transmit files using content-type "multipart/form-data"
    useForm = canConsumeForm;
    if (useForm) {
      formParams = new FormData();
    } else {
      formParams = new URLSearchParams();
    }

    if (requestParameters.document !== undefined) {
      formParams.append('document', requestParameters.document as any);
    }

    const response = await this.request(
      {
        path: `/documents/{spaceName}/add`.replace(
          `{${'spaceName'}}`,
          encodeURIComponent(String(requestParameters.spaceName))
        ),
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: formParams,
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Add a new document to a space
   */
  async documentsSpaceNameAddPost(
    requestParameters: DocumentsSpaceNameAddPostRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.documentsSpaceNameAddPostRaw(requestParameters, initOverrides);
  }

  /**
   * Serve document content from a space
   */
  async documentsSpaceNameContentGetRaw(
    requestParameters: DocumentsSpaceNameContentGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (
      requestParameters.spaceName === null ||
      requestParameters.spaceName === undefined
    ) {
      throw new runtime.RequiredError(
        'spaceName',
        'Required parameter requestParameters.spaceName was null or undefined when calling documentsSpaceNameContentGet.'
      );
    }

    if (
      requestParameters.path === null ||
      requestParameters.path === undefined
    ) {
      throw new runtime.RequiredError(
        'path',
        'Required parameter requestParameters.path was null or undefined when calling documentsSpaceNameContentGet.'
      );
    }

    const queryParameters: any = {};

    if (requestParameters.path !== undefined) {
      queryParameters['path'] = requestParameters.path;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/documents/{spaceName}/content`.replace(
          `{${'spaceName'}}`,
          encodeURIComponent(String(requestParameters.spaceName))
        ),
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Serve document content from a space
   */
  async documentsSpaceNameContentGet(
    requestParameters: DocumentsSpaceNameContentGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.documentsSpaceNameContentGetRaw(
      requestParameters,
      initOverrides
    );
  }

  /**
   * Delete a document from a space
   */
  async documentsSpaceNameDeleteDeleteRaw(
    requestParameters: DocumentsSpaceNameDeleteDeleteRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (
      requestParameters.spaceName === null ||
      requestParameters.spaceName === undefined
    ) {
      throw new runtime.RequiredError(
        'spaceName',
        'Required parameter requestParameters.spaceName was null or undefined when calling documentsSpaceNameDeleteDelete.'
      );
    }

    if (
      requestParameters.path === null ||
      requestParameters.path === undefined
    ) {
      throw new runtime.RequiredError(
        'path',
        'Required parameter requestParameters.path was null or undefined when calling documentsSpaceNameDeleteDelete.'
      );
    }

    const queryParameters: any = {};

    if (requestParameters.path !== undefined) {
      queryParameters['path'] = requestParameters.path;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/documents/{spaceName}/delete`.replace(
          `{${'spaceName'}}`,
          encodeURIComponent(String(requestParameters.spaceName))
        ),
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Delete a document from a space
   */
  async documentsSpaceNameDeleteDelete(
    requestParameters: DocumentsSpaceNameDeleteDeleteRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.documentsSpaceNameDeleteDeleteRaw(
      requestParameters,
      initOverrides
    );
  }

  /**
   * Delete a folder within a space
   */
  async documentsSpaceNameDeleteFolderDeleteRaw(
    requestParameters: DocumentsSpaceNameDeleteFolderDeleteRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (
      requestParameters.spaceName === null ||
      requestParameters.spaceName === undefined
    ) {
      throw new runtime.RequiredError(
        'spaceName',
        'Required parameter requestParameters.spaceName was null or undefined when calling documentsSpaceNameDeleteFolderDelete.'
      );
    }

    if (
      requestParameters.path === null ||
      requestParameters.path === undefined
    ) {
      throw new runtime.RequiredError(
        'path',
        'Required parameter requestParameters.path was null or undefined when calling documentsSpaceNameDeleteFolderDelete.'
      );
    }

    const queryParameters: any = {};

    if (requestParameters.path !== undefined) {
      queryParameters['path'] = requestParameters.path;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/documents/{spaceName}/deleteFolder`.replace(
          `{${'spaceName'}}`,
          encodeURIComponent(String(requestParameters.spaceName))
        ),
        method: 'DELETE',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Delete a folder within a space
   */
  async documentsSpaceNameDeleteFolderDelete(
    requestParameters: DocumentsSpaceNameDeleteFolderDeleteRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.documentsSpaceNameDeleteFolderDeleteRaw(
      requestParameters,
      initOverrides
    );
  }

  /**
   * List all documents within a space or sub-folder
   */
  async documentsSpaceNameListGetRaw(
    requestParameters: DocumentsSpaceNameListGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<
    runtime.ApiResponse<Array<DocumentsSpaceNameListGet200ResponseInner>>
  > {
    if (
      requestParameters.spaceName === null ||
      requestParameters.spaceName === undefined
    ) {
      throw new runtime.RequiredError(
        'spaceName',
        'Required parameter requestParameters.spaceName was null or undefined when calling documentsSpaceNameListGet.'
      );
    }

    if (
      requestParameters.path === null ||
      requestParameters.path === undefined
    ) {
      throw new runtime.RequiredError(
        'path',
        'Required parameter requestParameters.path was null or undefined when calling documentsSpaceNameListGet.'
      );
    }

    const queryParameters: any = {};

    if (requestParameters.path !== undefined) {
      queryParameters['path'] = requestParameters.path;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/documents/{spaceName}/list`.replace(
          `{${'spaceName'}}`,
          encodeURIComponent(String(requestParameters.spaceName))
        ),
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      jsonValue.map(DocumentsSpaceNameListGet200ResponseInnerFromJSON)
    );
  }

  /**
   * List all documents within a space or sub-folder
   */
  async documentsSpaceNameListGet(
    requestParameters: DocumentsSpaceNameListGetRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<Array<DocumentsSpaceNameListGet200ResponseInner>> {
    const response = await this.documentsSpaceNameListGetRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }
}
