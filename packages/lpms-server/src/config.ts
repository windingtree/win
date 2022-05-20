import dotenv from "dotenv";

dotenv.config();

const checkEnvVariables = (vars: string[]): void =>
  vars.forEach(
    variable => {
      if (
        !process.env[variable] ||
        process.env[variable] === ''
      ) {
        throw new Error(`${variable} must be provided in the ENV`);
      }
    }
  );

checkEnvVariables([
  'APP_PORT',
  'APP_ACCESS_TOKEN_KEY',
  'APP_REFRESH_TOKEN_KEY',
  'APP_WALLET_PASSPHRASE',
  'WEB3STORAGE_KEY'
]);

export const port = Number(process.env.APP_PORT);
export const accessTokenKey = String(process.env.APP_ACCESS_TOKEN_KEY);
export const refreshTokenKey = String(process.env.APP_REFRESH_TOKEN_KEY);
export const walletPassphrase = String(process.env.APP_WALLET_PASSPHRASE);
export const refreshTokenMaxAge = 30 * 24 * 60 * 60 * 1000; //30d
export const accessTokenMaxAge = 30 * 60 * 1000; //30m
export const defaultManagerLogin = 'manager';
export const defaultManagerPassword = 'winwin';
export const web3StorageKey = process.env.WEB3STORAGE_KEY as string;
