import { admin } from "@/config/firebase";
import { db } from "@/db/db-pgp";
import type { NextFunction, Request, Response } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";

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
      return res.status(400).send("@verifyToken invalid access token");
    }

    const decodedToken = await admin.auth().verifyIdToken(cookies.accessToken);

    // this should not happen!
    if (!decodedToken) {
      return res.status(400).send("@verifyToken no decodedToken returned");
    }

    res.locals.decodedToken = decodedToken;

    next();
  } catch (_err) {
    return res.status(400).send("@verifyToken error validating token");
  }
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
      const { cookies } = req;
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

      if (!cookies.accessToken) {
        return res.status(400).send("@verifyToken invalid access token");
      }

      const decodedToken: DecodedIdToken =
        res.locals.decodedToken ??
        (await admin.auth().verifyIdToken(cookies.accessToken));

      const users = await db.query(
        "SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1",
        [decodedToken.uid]
      );

      // admins should be allowed to access all routes
      if (roles.includes(users.at(0).role) || users.at(0).role === "admin") {
        next();
      } else {
        res
          .status(403)
          .send(`@verifyRole invalid role (required: ${requiredRole})`);
      }
    } catch (_err) {
      res.status(401).send("@verifyRole could not verify role");
    }
  };
};
