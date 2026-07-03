// Stub cooldownManager - stats.js uses this for rate limiting
module.exports = {
    check: () => true,
    set: () => {},
    reset: () => {},
    getRemainingTime: () => 0
};
