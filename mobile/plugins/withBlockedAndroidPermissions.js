/**
 * Blocks Android permissions that Expo's base manifest template or a dependency
 * adds by default but that PlantPals never uses (e.g. SYSTEM_ALERT_WINDOW —
 * "draw over other apps"). Unused sensitive permissions are a real Play Store
 * review risk, so this keeps the merged manifest minimal across every
 * `expo prebuild` run instead of relying on a one-off manual edit.
 */
const { AndroidConfig } = require('@expo/config-plugins');

const BLOCKED_PERMISSIONS = ['android.permission.SYSTEM_ALERT_WINDOW'];

module.exports = function withBlockedAndroidPermissions(config) {
  return AndroidConfig.Permissions.withBlockedPermissions(config, BLOCKED_PERMISSIONS);
};
