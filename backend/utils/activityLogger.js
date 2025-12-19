import db from '../config/database.js';

/**
 * Safely log activity to activity_logs table if it exists
 * @param {number} userId - User ID performing the action
 * @param {string} action - Action description
 * @param {string} entityType - Type of entity (category, asset, etc.)
 * @param {number} entityId - ID of the entity
 * @param {string} details - Additional details
 */
export async function logActivity(userId, action, entityType, entityId, details) {
  // Activity logging to DB is disabled
  console.log(`Activity Log: User ${userId} performed ${action} on ${entityType} ${entityId}: ${details}`);
}


