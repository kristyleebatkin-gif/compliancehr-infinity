export const VAULT_PROVIDER_ROLES = [
  'admin',
  'Provider Administrator',
  'Compliance Manager',
  'Compliance Administrator',
];

export const VAULT_MANAGER_ROLES = [
  ...VAULT_PROVIDER_ROLES,
  'Management',
  'Administration',
  'Team Leader',
  'Human Resources Manager',
  'Quality & Improvement Manager',
];

export const isVaultProvider = (role) => VAULT_PROVIDER_ROLES.includes(role);
export const isVaultManager = (role) => VAULT_MANAGER_ROLES.includes(role);