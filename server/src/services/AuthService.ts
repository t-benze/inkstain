import {
  SignUpRequest,
  ConfirmSignUpRequest,
  SignInRequest,
  ForgotPasswordRequest,
  ConfirmForgotPasswordRequest,
} from '~/server/types';
import { AuthInterface } from '~/server/proxy/types';

export class AuthService implements AuthInterface {
  constructor(private readonly authProxy: AuthInterface) {}

  async isAuthenticated() {
    return await this.authProxy.isAuthenticated();
  }

  async userInfo() {
    return await this.authProxy.userInfo();
  }

  async signUp(params: SignUpRequest) {
    return await this.authProxy.signUp(params);
  }

  async confirmSignUp(params: ConfirmSignUpRequest) {
    return await this.authProxy.confirmSignUp(params);
  }

  async signIn(params: SignInRequest) {
    return await this.authProxy.signIn(params);
  }

  async signOut() {
    return await this.authProxy.signOut();
  }

  async forgotPassword(params: ForgotPasswordRequest) {
    return await this.authProxy.forgotPassword(params);
  }

  async confirmForgotPassword(params: ConfirmForgotPasswordRequest) {
    return await this.authProxy.confirmForgotPassword(params);
  }
}
