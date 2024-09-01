import { Next } from 'koa';
import { Context } from '~/server/types';

export const guardAuthenticated = async (ctx: Context, next: Next) => {
  if (!(await ctx.authService.isAuthenticated())) {
    ctx.throw(401, 'Unauthenticated');
  }
  return next();
};
