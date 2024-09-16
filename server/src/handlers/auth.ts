import Router from '@koa/router';
import { Context } from '~/server/types';
import {
  SignUpRequest,
  ConfirmSignUpRequest,
  SignInRequest,
  ForgotPasswordRequest,
  ConfirmForgotPasswordRequest,
} from '@inkstain/client-api';
import { AuthServiceError } from '~/server/services/AuthService';
import { guardAuthenticated } from '~/server/middlewares/guardAuthenticated';

const handleError = (ctx: Context, error: Error) => {
  if (error instanceof AuthServiceError) {
    ctx.throw(400, error.message, {
      code: error.code,
    });
  }
  ctx.throw(500, error.message);
};

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Auth]
 *     operationId: signUp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpRequest'
 *     responses:
 *       200:
 *         description: User signed up successfully
 *       500:
 *         description: Server error
 */
const signUp = async (ctx: Context) => {
  const body = ctx.request.body as SignUpRequest;
  try {
    await ctx.authService.signUp(body);
    ctx.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * @swagger
 * /auth/confirm-signup:
 *   post:
 *     summary: Confirm user signup
 *     tags: [Auth]
 *     operationId: confirmSignUp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmSignUpRequest'
 *     responses:
 *       200:
 *         description: Signup confirmed successfully
 *       500:
 *         description: Server error
 */
const confirmSignUp = async (ctx: Context) => {
  const body = ctx.request.body as ConfirmSignUpRequest;
  try {
    await ctx.authService.confirmSignUp(body);
    ctx.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Sign in a user
 *     tags: [Auth]
 *     operationId: signIn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignInRequest'
 *     responses:
 *       200:
 *         description: User signed in successfully
 *       500:
 *         description: Server error
 */
const signIn = async (ctx: Context) => {
  const body = ctx.request.body as SignInRequest;
  try {
    await ctx.authService.signIn(body);
    ctx.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * @swagger
 * /auth/user:
 *   get:
 *     summary: Get authentication status
 *     tags: [Auth]
 *     operationId: userInfo
 *     responses:
 *       200:
 *         description: Authentication status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfo'
 *       500:
 *         description: Server error
 */
const userInfo = async (ctx: Context) => {
  try {
    const userInfo = await ctx.authService.userInfo();
    ctx.body = userInfo;
    ctx.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * @swagger
 * /auth/signout:
 *   post:
 *     summary: Sign out a user
 *     tags: [Auth]
 *     operationId: signOut
 *     responses:
 *       200:
 *         description: User signed out successfully
 */
const signOut = async (ctx: Context) => {
  try {
    await ctx.authService.signOut();
    ctx.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Initiate forgot password process
 *     tags: [Auth]
 *     operationId: forgotPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Forgot password process initiated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
const forgotPassword = async (ctx: Context) => {
  const body = ctx.request.body as ForgotPasswordRequest;
  try {
    await ctx.authService.forgotPassword(body);
    ctx.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
};

/**
 * @swagger
 * /auth/confirm-forgot-password:
 *   post:
 *     summary: Confirm forgot password
 *     tags: [Auth]
 *     operationId: confirmForgotPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConfirmForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
const confirmForgotPassword = async (ctx: Context) => {
  const body = ctx.request.body as ConfirmForgotPasswordRequest;
  try {
    await ctx.authService.confirmForgotPassword(body);
    ctx.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
};

export const registerAuthRoutes = (router: Router) => {
  router.post('/auth/signup', signUp);
  router.post('/auth/confirm-signup', confirmSignUp);
  router.post('/auth/signin', signIn);
  router.post('/auth/forgot-password', forgotPassword);
  router.post('/auth/confirm-forgot-password', confirmForgotPassword);
  router.get('/auth/user', guardAuthenticated, userInfo);
  router.post('/auth/signout', guardAuthenticated, signOut);
};