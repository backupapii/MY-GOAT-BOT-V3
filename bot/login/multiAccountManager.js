// Stub multiAccountManager - account.js uses this for multi-account management
module.exports = {
    getAccounts: () => [],
    getActiveAccount: () => null,
    switchAccount: () => false,
    resetFailed: () => {},
    getStatus: () => ({ active: 1, total: 1, failed: 0 })
};
