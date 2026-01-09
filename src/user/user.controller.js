const bcrypt = require('bcrypt');
const { query } = require('../db');

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, bio, phone, dateOfBirth, address, preferences } = req.body;

    // Update user basic info
    if (firstName || lastName) {
      await query(`
        UPDATE users
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [firstName, lastName, userId]);
    }

    // Update or insert user profile
    const profileData = {
      bio,
      phone,
      date_of_birth: dateOfBirth,
      address: address ? JSON.stringify(address) : null,
      preferences: preferences ? JSON.stringify(preferences) : null
    };

    // Remove null values for the query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    Object.entries(profileData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(value);
        paramCount++;
      }
    });

    if (updateFields.length > 0) {
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateValues.push(userId);

      await query(`
        INSERT INTO user_profiles (user_id, ${Object.keys(profileData).filter(key => profileData[key] !== undefined).join(', ')})
        VALUES ($1, ${Array.from({length: Object.values(profileData).filter(v => v !== undefined).length}, (_, i) => `$${i + 2}`).join(', ')})
        ON CONFLICT (user_id) DO UPDATE SET
        ${updateFields.join(', ')}
      `, [userId, ...updateValues.slice(0, -1), userId]);
    }

    // Return updated user data
    const userResult = await query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.email_verified,
             u.created_at, p.bio, p.avatar_url, p.phone, p.date_of_birth,
             p.address, p.preferences
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = $1
    `, [userId]);

    const user = userResult.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      phone: user.phone,
      dateOfBirth: user.date_of_birth,
      address: user.address,
      preferences: user.preferences,
      emailVerified: user.email_verified,
      createdAt: user.created_at
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    // Get current password hash
    const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentHash = userResult.rows[0].password_hash;

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, currentHash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(`
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [newPasswordHash, userId]);

    // Revoke all refresh tokens for security
    await query(`
      UPDATE refresh_tokens
      SET revoked = true
      WHERE user_id = $1
    `, [userId]);

    res.json({ message: 'Password changed successfully. Please login again.' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    // Verify password before deletion
    const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordHash = userResult.rows[0].password_hash;
    const isValidPassword = await bcrypt.compare(password, passwordHash);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Delete user (cascade will handle related records)
    await query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user profile by ID (public or private based on auth)
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.userId;

    // Get user profile
    const userResult = await query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.created_at,
             p.bio, p.avatar_url, p.phone, p.date_of_birth,
             CASE WHEN u.id = $2 THEN p.address ELSE NULL END as address,
             CASE WHEN u.id = $2 THEN p.preferences ELSE NULL END as preferences
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = $1 AND u.is_active = true
    `, [userId, currentUserId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      phone: user.phone,
      dateOfBirth: user.date_of_birth,
      address: user.address,
      preferences: user.preferences,
      createdAt: user.created_at,
      isOwnProfile: user.id === currentUserId
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search users (basic implementation)
exports.searchUsers = async (req, res) => {
  try {
    const { q, limit = 10, offset = 0 } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const usersResult = await query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.created_at,
             p.bio, p.avatar_url
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.is_active = true
      AND (u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR u.email ILIKE $1)
      ORDER BY u.created_at DESC
      LIMIT $2 OFFSET $3
    `, [`%${q}%`, limit, offset]);

    const users = usersResult.rows.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at
    }));

    res.json({ users, limit: parseInt(limit), offset: parseInt(offset) });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
