// src/controllers/userController.js
const User = require('../models/User');
const logger = require('../config/logger');

// --- Get the profile of the currently logged-in user ---
exports.getProfile = (req, res) => {
  // Log the successful retrieval of a user's own profile.
  logger.info(`User '${req.user.username}' (ID: ${req.user.id}) retrieved their own profile.`);

  // req.user is attached by our authenticateToken middleware.
  res.status(200).json({
    message: 'Profile data retrieved successfully',
    user: req.user
  });
};

// --- List all users (For Admins/Librarians) ---
exports.listUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      // Exclude password from the result set for security.
      attributes: ['id', 'username', 'email', 'role', 'createdAt', 'updatedAt']
    });

    // Log the successful listing of all users by a privileged user.
    logger.info(`User '${req.user.username}' (ID: ${req.user.id}) listed all users.`);
    res.status(200).json(users);
  } catch (error) {
    // Log any unexpected server error.
    logger.error(`Error in listUsers, triggered by user '${req.user.username}':`, error);
    res.status(500).json({ error: 'An error occurred while fetching users.' });
  }
};

// --- Change a user's role (For Admins only) ---
exports.changeUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const adminUser = req.user; // The admin performing the action.

  try {
    // Validate the role.
    if (!['MEMBER', 'LIBRARIAN', 'ADMIN'].includes(role)) {
      // Log the bad request from the client.
      logger.warn(`Admin '${adminUser.username}' (ID: ${adminUser.id}) attempted to set an invalid role ('${role}') for user (ID: ${userId}).`);
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    const userToUpdate = await User.findByPk(userId);
    if (!userToUpdate) {
      // Log the attempt to modify a non-existent user.
      logger.warn(`Admin '${adminUser.username}' (ID: ${adminUser.id}) attempted to change role for non-existent user (ID: ${userId}).`);
      return res.status(404).json({ error: 'User not found.' });
    }

    const oldRole = userToUpdate.role;
    userToUpdate.role = role;
    await userToUpdate.save();

    // Log the successful, security-sensitive event with full context.
    logger.info(`SECURITY: Admin '${adminUser.username}' (ID: ${adminUser.id}) changed the role of user '${userToUpdate.username}' (ID: ${userId}) from '${oldRole}' to '${role}'.`);

    res.status(200).json({
      message: 'User role updated successfully.',
      user: { id: userToUpdate.id, username: userToUpdate.username, role: userToUpdate.role }
    });
  } catch (error) {
    // Log any unexpected server error.
    logger.error(`Error in changeUserRole for user (ID: ${userId}), triggered by admin '${adminUser.username}':`, error);
    res.status(500).json({ error: 'An error occurred while updating the user role.' });
  }
};
