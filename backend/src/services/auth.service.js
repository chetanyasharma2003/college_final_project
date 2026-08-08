import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export class AuthService {
  // Generate JWT token
  static generateToken(userId, expiresIn = '15m') {
    return jwt.sign(
      { userId, iat: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn }
    );
  }

  // Generate Refresh Token
  static generateRefreshToken(userId) {
    return jwt.sign(
      { userId, type: 'refresh', iat: Date.now() },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  // Register new user
  static async register(email, password, fullName, role = 'VIEWER', stateAccess = null) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password_hash: hashedPassword,
          full_name: fullName,
          role,
          state_access: stateAccess,
        },
      });

      // Generate tokens
      const accessToken = this.generateToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Log audit
      await this.logAudit(null, 'USER_REGISTERED', 'User', user.id, null);

      return {
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Login user
  static async login(email, password) {
    try {
      // Find user
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check if active
      if (!user.is_active) {
        throw new Error('User account is disabled');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() },
      });

      // Generate tokens
      const accessToken = this.generateToken(user.id);
      const refreshToken = this.generateRefreshToken(user.id);

      // Log audit
      await this.logAudit(user.id, 'USER_LOGIN', 'User', user.id, null);

      return {
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            state_access: user.state_access,
          },
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Refresh token
  static async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.is_active) {
        throw new Error('Invalid or expired refresh token');
      }

      // Generate new access token
      const newAccessToken = this.generateToken(user.id);

      return {
        status: 'success',
        data: { accessToken: newAccessToken },
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Invalid refresh token',
      };
    }
  }

  // Get current user
  static async getCurrentUser(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          full_name: true,
          role: true,
          state_access: true,
          created_at: true,
          last_login: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        status: 'success',
        data: user,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Log audit trail
  static async logAudit(userId, action, tableName, recordId, changes) {
    try {
      await prisma.auditLog.create({
        data: {
          user_id: userId,
          action,
          table_name: tableName,
          record_id: recordId,
          changes: changes ? JSON.stringify(changes) : null,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  // Logout (invalidate token - optional, can be done client-side)
  static async logout(userId) {
    try {
      await this.logAudit(userId, 'USER_LOGOUT', 'User', userId, null);
      return {
        status: 'success',
        message: 'Logged out successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}

export default AuthService;
