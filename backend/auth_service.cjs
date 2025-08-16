// Advanced Authentication and Authorization Service
// Provides secure authentication and role-based access control

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aqkaxcwdcqnwzgvaqtne.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxa2F4Y3dkY3Fud3pndmFxdG5lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQzMDc1MCwiZXhwIjoyMDY3MDA2NzUwfQ.H10_HKP1Zie6QO9vc4YhHVgbOudVSiSzk1euC3tZki8';
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

class AuthService {
  constructor() {
    this.rateLimitStore = new Map();
    this.maxLoginAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
  }

  // User Registration
  async registerUser(userData) {
    try {
      const { email, password, name, role = 'user' } = userData;

      // Validate input
      if (!email || !password || !name) {
        throw new Error('Email, password, and name are required');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password: hashedPassword,
            name,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // User Login
  async loginUser(credentials) {
    try {
      const { email, password } = credentials;

      // Check rate limiting
      if (this.isRateLimited(email)) {
        throw new Error('Too many login attempts. Please try again later.');
      }

      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Find user
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        this.incrementLoginAttempts(email);
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        this.incrementLoginAttempts(email);
        throw new Error('Invalid credentials');
      }

      // Reset login attempts on successful login
      this.resetLoginAttempts(email);

      // Update last login
      await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify JWT Token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return {
        success: true,
        user: decoded
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid token'
      };
    }
  }

  // Role-based Authorization
  async authorizeUser(userId, requiredRole) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const hasPermission = this.checkRolePermission(user.role, requiredRole);
      
      return {
        success: hasPermission,
        user: user
      };

    } catch (error) {
      console.error('Authorization error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check Role Permissions
  checkRolePermission(userRole, requiredRole) {
    const roleHierarchy = {
      'admin': ['admin', 'moderator', 'user'],
      'moderator': ['moderator', 'user'],
      'user': ['user']
    };

    return roleHierarchy[userRole]?.includes(requiredRole) || false;
  }

  // Generate JWT Token
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Rate Limiting
  isRateLimited(email) {
    const attempts = this.rateLimitStore.get(email);
    if (!attempts) return false;

    const { count, timestamp } = attempts;
    const now = Date.now();

    // Reset if lockout period has passed
    if (now - timestamp > this.lockoutDuration) {
      this.rateLimitStore.delete(email);
      return false;
    }

    return count >= this.maxLoginAttempts;
  }

  incrementLoginAttempts(email) {
    const attempts = this.rateLimitStore.get(email) || { count: 0, timestamp: Date.now() };
    attempts.count++;
    this.rateLimitStore.set(email, attempts);
  }

  resetLoginAttempts(email) {
    this.rateLimitStore.delete(email);
  }

  // Password Reset
  async requestPasswordReset(email) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('email', email)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { id: user.id, type: 'password_reset' },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Store reset token
      await supabase
        .from('password_resets')
        .insert([
          {
            user_id: user.id,
            token: resetToken,
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
          }
        ]);

      // TODO: Send email with reset link
      console.log(`Password reset requested for ${email}. Token: ${resetToken}`);

      return {
        success: true,
        message: 'Password reset email sent'
      };

    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async resetPassword(token, newPassword) {
    try {
      // Verify reset token
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid reset token');
      }

      // Check if token exists and is not expired
      const { data: resetRecord, error: resetError } = await supabase
        .from('password_resets')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (resetError || !resetRecord) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', decoded.id);

      if (updateError) throw updateError;

      // Mark reset token as used
      await supabase
        .from('password_resets')
        .update({ used: true })
        .eq('token', token);

      return {
        success: true,
        message: 'Password reset successfully'
      };

    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // User Management
  async updateUserProfile(userId, updates) {
    try {
      const allowedUpdates = ['name', 'email'];
      const filteredUpdates = {};

      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      filteredUpdates.updated_at = new Date().toISOString();

      const { data: user, error } = await supabase
        .from('users')
        .update(filteredUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };

    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get current user
      const { data: user, error } = await supabase
        .from('users')
        .select('password')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Session Management
  async getUserSessions(userId) {
    try {
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        sessions: sessions || []
      };

    } catch (error) {
      console.error('Get sessions error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async revokeSession(sessionId, userId) {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (error) throw error;

      return {
        success: true,
        message: 'Session revoked successfully'
      };

    } catch (error) {
      console.error('Revoke session error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cleanup expired sessions
  async cleanupExpiredSessions() {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;

      console.log('Expired sessions cleaned up');
      return { success: true };

    } catch (error) {
      console.error('Session cleanup error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = AuthService;