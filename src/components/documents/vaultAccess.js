export const isVaultProvider = (role) => ['admin', 'Provider Administrator'].includes(role);
export const isVaultManager = (role) => isVaultProvider(role) || role === 'Management';