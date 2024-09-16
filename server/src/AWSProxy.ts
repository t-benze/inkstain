import {
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUser,
  AuthenticationDetails,
  CognitoIdToken,
  CognitoRefreshToken,
} from 'amazon-cognito-identity-js';
import {
  cognitoUserPoolId,
  cognitoUserPoolClientId,
  intelligenceAPIBase,
  tokensFile,
} from '~/server/settings';
import fs from 'fs/promises';
import {
  AuthProxy,
  IntelligenceProxy,
  SignUpRequest,
  ConfirmSignUpRequest,
  SignInRequest,
  ForgotPasswordRequest,
  ConfirmForgotPasswordRequest,
  DocumentTextDetectionDataInner,
} from '~/server/types';

type Tokens = {
  idToken: string;
  refreshToken: string;
  expiration: number;
};

export class AWSProxy implements AuthProxy, IntelligenceProxy {
  private userPool: CognitoUserPool;
  private tokens: Tokens | null = null;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: cognitoUserPoolId,
      ClientId: cognitoUserPoolClientId,
    });
  }

  decodeIDToken(token: string) {
    const idToken = new CognitoIdToken({ IdToken: token });
    const decoded = idToken.decodePayload();
    return {
      username: decoded['cognito:username'],
      email: decoded['email'],
    };
  }

  async getTokens() {
    try {
      if (!this.tokens) {
        const tokenFile = await fs.readFile(tokensFile, 'utf8');
        this.tokens = JSON.parse(tokenFile) as Tokens;
      }
    } catch (error) {
      return null;
    }
    if (this.tokens.expiration < Date.now() / 1000) {
      // const newTokens = await this.refreshTokens(this.tokens.
      const { username } = this.decodeIDToken(this.tokens.idToken);
      try {
        this.tokens = await this.refreshTokens(
          username,
          this.tokens.refreshToken
        );
      } catch (error) {
        await fs.unlink(tokensFile);
        return null;
      }
    }
    return this.tokens;
  }

  async saveTokens(tokens: Tokens) {
    this.tokens = tokens;
    await fs.writeFile(tokensFile, JSON.stringify(this.tokens));
  }

  async isAuthenticated() {
    const tokens = await this.getTokens();
    return !!tokens;
  }

  async userInfo() {
    const { idToken: tokenString } = await this.getTokens();
    return this.decodeIDToken(tokenString);
  }

  refreshTokens(username: string, refreshToken: string): Promise<Tokens> {
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: this.userPool,
    });
    const cognitoRefreshToken = new CognitoRefreshToken({
      RefreshToken: refreshToken,
    });
    return new Promise((resolve, reject) => {
      cognitoUser.refreshSession(cognitoRefreshToken, (err, session) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            idToken: session.getIdToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
            expiration: session.getIdToken().getExpiration(),
          });
        }
      });
    });
  }

  signUp(params: SignUpRequest) {
    return new Promise<void>((resolve, reject) => {
      this.userPool.signUp(
        params.username,
        params.password,
        [new CognitoUserAttribute({ Name: 'email', Value: params.email })],
        null,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  confirmSignUp(params: ConfirmSignUpRequest) {
    return new Promise<void>((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: params.username,
        Pool: this.userPool,
      });
      cognitoUser.confirmRegistration(params.code, true, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  signIn(params: SignInRequest) {
    return new Promise<void>((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: params.username,
        Pool: this.userPool,
      });
      cognitoUser.authenticateUser(
        new AuthenticationDetails({
          Username: params.username,
          Password: params.password,
        }),
        {
          onSuccess: (data) => {
            this.saveTokens({
              idToken: data.getIdToken().getJwtToken(),
              refreshToken: data.getRefreshToken().getToken(),
              expiration: data.getIdToken().getExpiration(),
            });
            resolve();
          },
          onFailure: (err) => {
            reject(err);
          },
        }
      );
    });
  }

  async signOut() {
    const user = await this.userInfo();
    const cognitoUser = new CognitoUser({
      Username: user.username,
      Pool: this.userPool,
    });
    await cognitoUser.signOut();
    this.tokens = null;
    try {
      await fs.unlink(tokensFile);
    } catch (error) {
      console.error('Failed to delete tokens file', error);
    }
  }

  forgotPassword(params: ForgotPasswordRequest) {
    return new Promise<void>((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: params.username,
        Pool: this.userPool,
      });
      cognitoUser.forgotPassword({
        onSuccess: resolve,
        onFailure: reject,
      });
    });
  }

  confirmForgotPassword(params: ConfirmForgotPasswordRequest) {
    return new Promise<void>((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: params.username,
        Pool: this.userPool,
      });
      cognitoUser.confirmPassword(params.code, params.newPassword, {
        onSuccess: () => {
          resolve();
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  async analyzeDocument(
    image: string
  ): Promise<DocumentTextDetectionDataInner[]> {
    const { idToken: tokenString } = await this.getTokens();
    const response = await fetch(`${intelligenceAPIBase}/analyze-document`, {
      method: 'POST',
      body: image,
      headers: {
        'Content-Type': 'plain/text',
        Authorization: `Bearer ${tokenString}`,
      },
    });
    if (!response.ok) {
      throw new Error(
        `Intelligence API error: ${response.statusText} ${response.headers.get(
          'x-amzn-ErrorType'
        )}; RequestId: ${response.headers.get('x-amzn-RequestId')}`
      );
    }
    const data = (await response.json()) as DocumentTextDetectionDataInner[];
    return data;
  }
}