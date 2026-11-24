
import mongoose from 'mongoose';
import {
    getAllUsers as findAllUsers,
    getUserById as findUserById,
    updateUser as updateUserRecord,
    deleteUser as deleteUserRecord
} from '../models/users.js';

const canManageUser = (req, userId) => {
    return req.user.role === 'admin' || req.user.id === userId;
};

// GET /api/users
export async function getAllUsers(req, res) {
    try {
        const currentUser = {
            id: req.user.id,
            role: req.user.role
        };

        if (req.user.role === 'admin') {
            const users = await findAllUsers();

            return res.status(200).json({
                users,
                currentUser
            });
        }

        const user = await findUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            users: [user],
            currentUser
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            error: 'Failed to fetch users'
        });
    }
}

// GET /api/users/:id
export async function getUserById(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                error: 'Invalid user ID'
            });
        }

        if (!canManageUser(req, id)) {
            return res.status(403).json({
                error: 'Forbidden'
            });
        }

        const user = await findUserById(id);

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({
            error: 'Failed to fetch user'
        });
    }
}

// PUT /api/users/:id
export async function updateUser(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                error: 'Invalid user ID'
            });
        }

        if (!canManageUser(req, id)) {
            return res.status(403).json({
                error: 'Forbidden'
            });
        }

        const body = req.body || {};
        const allowedFields = ['displayName', 'username', 'email'];
        const updates = {};

        for (const field of allowedFields) {
            if (Object.hasOwn(body, field)) {
                if (
                    typeof body[field] !== 'string' ||
                    !body[field].trim()
                ) {
                    return res.status(400).json({
                        error: `${field} must be a non-empty string`
                    });
                }

                updates[field] = body[field].trim();
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                error: 'At least one valid field is required'
            });
        }

        const existingUser = await findUserById(id);

        if (!existingUser) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        if (updates.email) {
            updates.email = updates.email.toLowerCase();
        }

        if (updates.username) {
            updates.username = updates.username.toLowerCase();
        }

        const updatedUser = await updateUserRecord(id, updates);

        if (!updatedUser) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Keep the current user's session details in sync.
        if (req.user.id === id) {
            req.session.user = {
                ...req.session.user,
                displayName: updatedUser.displayName,
                username: updatedUser.username,
                email: updatedUser.email
            };
        }

        return res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                error: 'Username or email already exists'
            });
        }

        console.error('Error updating user:', error);
        return res.status(500).json({
            error: 'Failed to update user'
        });
    }
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                error: 'Invalid user ID'
            });
        }

        if (!canManageUser(req, id)) {
            return res.status(403).json({
                error: 'Forbidden'
            });
        }

        const deletedUser = await deleteUserRecord(id);

        if (!deletedUser) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Destroy the session when users delete their own accounts.
        if (req.user.id === id) {
            return req.session.destroy((error) => {
                if (error) {
                    console.error('Error destroying session:', error);

                    return res.status(500).json({
                        error: 'Account deleted, but session cleanup failed'
                    });
                }

                res.clearCookie('connect.sid');

                return res.status(200).json({
                    message: 'Account deleted successfully'
                });
            });
        }

        return res.status(200).json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);

        return res.status(500).json({
            error: 'Failed to delete user'
        });
    }
}

// GET /users-admin
export function usersAdminPage(req, res) {
    return res.render('auth/users-admin', {
        title: 'Manage Users'
    });
}
