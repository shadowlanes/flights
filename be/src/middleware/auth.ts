import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers as any });
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = session.user as AuthRequest["user"];
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
