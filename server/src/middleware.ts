import { admin } from '@/config/firebase';
import { db } from '@/db/db-pgp';
import type { NextFunction, Request, Response } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

const ADMIN_ROLES = ['Admin', 'Super Admin'];

type AuthenticatedUser = {
  id: string;
  role: string;
};

export const getVerifiedToken = async (
  req: Request,
  res: Response
): Promise<DecodedIdToken> => {
  const decodedToken: DecodedIdToken | undefined = res.locals.decodedToken;
  const accessToken = req.cookies.accessToken;

  if (!decodedToken && !accessToken) {
    throw new Error('Missing access token');
  }

  const verifiedToken =
    decodedToken ?? (await admin.auth().verifyIdToken(accessToken));

  res.locals.decodedToken = verifiedToken;

  return verifiedToken;
};

/**
 * Verifies the access token attached to the request's cookies.
 */
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cookies } = req;

    if (!cookies.accessToken) {
      return res.status(400).send('@verifyToken invalid access token');
    }

    const decodedToken = await admin.auth().verifyIdToken(cookies.accessToken);

    // this should not happen!
    if (!decodedToken) {
      return res.status(400).send('@verifyToken no decodedToken returned');
    }

    res.locals.decodedToken = decodedToken;

    next();
  } catch (_err) {
    return res.status(400).send('@verifyToken error validating token');
  }
};

export const getAuthenticatedUser = async (
  req: Request,
  res: Response
): Promise<AuthenticatedUser> => {
  const cachedUser = res.locals.authenticatedUser as AuthenticatedUser | undefined;
  if (cachedUser) {
    return cachedUser;
  }

  const verifiedToken = await getVerifiedToken(req, res);

  const users = await db.query(
    'SELECT id, role FROM gcf_user WHERE id = $1 LIMIT 1',
    [verifiedToken.uid]
  );

  const authenticatedUser = users.at(0);
  if (!authenticatedUser) {
    throw new Error('Authenticated user not found');
  }

  res.locals.authenticatedUser = authenticatedUser;

  return authenticatedUser;
};

/**
 * A higher order function returning a middleware that protects routes based on the user's role.
 * The role "admin" can access all routes
 *
 * @param requiredRole a list of roles that can use this route
 */
export const verifyRole = (requiredRole: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      const user = await getAuthenticatedUser(req, res);

      // admins should be allowed to access all routes
      if (roles.includes(user.role) || ADMIN_ROLES.includes(user.role)) {
        next();
      } else {
        res
          .status(403)
          .send(`@verifyRole invalid role (required: ${requiredRole})`);
      }
    } catch (_err) {
      res.status(401).send('@verifyRole could not verify role');
    }
  };
};
