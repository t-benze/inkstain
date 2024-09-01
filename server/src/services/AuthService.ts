import { AuthProxy } from '~/server/types';

export class AuthServiceError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
  }
}

export class AuthService implements AuthProxy {
  constructor(private readonly authProxy: AuthProxy) {}

  async isAuthenticated() {
    return await this.authProxy.isAuthenticated();
  }

  async userInfo() {
    return await this.authProxy.userInfo();
  }

  async signUp(params) {
    try {
      return await this.authProxy.signUp(params);
    } catch (error) {
      if (error.code) {
        throw new AuthServiceError(error.message, error.code);
      }
      throw error;
    }
  }

  async confirmSignUp(params) {
    try {
      return await this.authProxy.confirmSignUp(params);
    } catch (error) {
      if (error.code) {
        throw new AuthServiceError(error.message, error.code);
      }
      throw error;
    }
  }

  async signIn(params) {
    try {
      return await this.authProxy.signIn(params);
    } catch (error) {
      if (error.code) {
        throw new AuthServiceError(error.message, error.code);
      }
      throw error;
    }
  }

  async signOut() {
    try {
      return await this.authProxy.signOut();
    } catch (error) {
      if (error.code) {
        throw new AuthServiceError(error.message, error.code);
      }
      throw error;
    }
  }

  async forgotPassword(params) {
    try {
      return await this.authProxy.forgotPassword(params);
    } catch (error) {
      if (error.code) {
        throw new AuthServiceError(error.message, error.code);
      }
      throw error;
    }
  }

  async confirmForgotPassword(params) {
    try {
      return await this.authProxy.confirmForgotPassword(params);
    } catch (error) {
      if (error.code) {
        throw new AuthServiceError(error.message, error.code);
      }
      throw error;
    }
  }
}
