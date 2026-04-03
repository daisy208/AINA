/**
 * Authentication Service
 * Handles user registration, login, token management
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../lib/prisma';
import logger from '../../config/logger';
import { ConflictError, AuthenticationError, NotFoundError } from '../../utils/errors';
import { getEnv } from '../../config/env';

/**
 * Register a new user
 */
export async function register(payload: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}) {
  try {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(payload.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phoneNumber: payload.phoneNumber,
      },
    });

    // Generate tokens
    const tokens = generateTokens(user.id);

    logger.info('user_registered', { userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
    };
  } catch (error) {
    logger.error('registration_failed', {
      email: payload.email,
      error: (error as Error).message,
    });
    throw error;
  }
}

/**
 * Login user
 */
export async function login(payload: { email: string; password: string }) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(payload.password, user.password);
    if (!isValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    logger.info('user_login', { userId: user.id });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
    };
  } catch (error) {
    logger.error('login_failed', {
      email: payload.email,
      error: (error as Error).message,
    });
    throw error;
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string) {
  try {
    const env = getEnv();

    // Hash the token to find it
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    // Find refresh token
    const dbToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!dbToken || dbToken.revoked) {
      throw new AuthenticationError('Invalid or revoked refresh token');
    }

    if (new Date() > dbToken.expiresAt) {
      throw new AuthenticationError('Refresh token expired');
    }

    // Generate new tokens
    const tokens = generateTokens(dbToken.userId);

    logger.info('token_refreshed', { userId: dbToken.userId });

    return tokens;
  } catch (error) {
    logger.error('token_refresh_failed', {
      error: (error as Error).message,
    });
    throw error;
  }
}

/**
 * Logout - revoke refresh token
 */
export async function logout(userId: string, refreshToken: string) {
  try {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await prisma.refreshToken.updateMany({
      where: { userId, tokenHash },
      data: { revoked: true },
    });

    logger.info('user_logout', { userId });
  } catch (error) {
    logger.error('logout_failed', {
      userId,
      error: (error as Error).message,
    });
  }
}

/**
 * Generate access and refresh tokens
 */
function generateTokens(userId: string) {
  const env = getEnv();

  // Access token
  const accessToken = jwt.sign(
    { sub: userId, type: 'access' },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    }
  );

  // Refresh token
  const refreshTokenValue = crypto.randomBytes(64).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenValue).digest('hex');

  const expirationMs = parseDuration(env.JWT_REFRESH_EXPIRES_IN);
  const expiresAt = new Date(Date.now() + expirationMs);

  // Store refresh token hash in database
  prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: refreshTokenHash,
      expiresAt,
    },
  }).catch((error) => {
    logger.error('refresh_token_storage_failed', { userId, error: (error as Error).message });
  });

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    expiresIn: env.JWT_EXPIRES_IN,
  };
}

/**
 * Parse duration string to milliseconds
 */
function parseDuration(duration: string): number {
  const value = parseInt(duration, 10);

  if (duration.endsWith('d')) return value * 24 * 60 * 60 * 1000;
  if (duration.endsWith('h')) return value * 60 * 60 * 1000;
  if (duration.endsWith('m')) return value * 60 * 1000;
  return value;
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      profileImage: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  payload: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: payload,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
    },
  });

  logger.info('user_profile_updated', { userId });
  return user;
}
