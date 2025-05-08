export const validateConfig = (config) => {
    if (!config || typeof config !== 'object') return false;
    if (!config.path || typeof config.path !== 'string') return false;
    return true;
  };