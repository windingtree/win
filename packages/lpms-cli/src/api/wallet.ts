import type { ActionController } from '../types';
import { utils, Wallet, providers } from 'ethers';
import ora from 'ora';
import { requiredConfig, getConfig } from './config';
import { green } from '../utils/print';

export const getProvider = () => {
  requiredConfig(['providerUri']);

  return new providers.JsonRpcProvider(
    getConfig('providerUri') as string
  );
};

export const getWalletByAccountIndex = (index: number): Wallet => {
  requiredConfig(['mnemonic']);

  const provider = getProvider();

  return new Wallet(
    utils.HDNode
      .fromMnemonic(getConfig('mnemonic') as string)
      .derivePath(`m/44'/60'/0'/0/${index}`)
  )
    .connect(provider);
}

export const walletController: ActionController = async (_, program) => {
  const spinner = ora('Getting wallet status').start();

  try {
    requiredConfig(['defaultAccountIndex']);

    const wallet = getWalletByAccountIndex(
      getConfig('defaultAccountIndex') as number
    );
    const accountAddress = await wallet.getAddress();
    const accountBalance = await wallet.getBalance();
    const formattedBalance = utils.formatEther(accountBalance);

    spinner.stop();

    green(`Wallet account: ${accountAddress} (${formattedBalance} xDAI)`);
  } catch (error) {
    spinner.stop();
    program.error(error, { exitCode: 1 });
  }
}
