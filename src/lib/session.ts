import { SessionOptions } from 'iron-session';
import type { SessionData } from '@/types';

export type { SessionData };

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'devis-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 8, // 8 heures
  },
};
