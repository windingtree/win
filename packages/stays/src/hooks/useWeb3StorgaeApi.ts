import { Web3StorageApi } from '@windingtree/ipfs-apis';
import { useMemo } from 'react';
import { web3StorageKey } from '../config';

export const useWeb3StorageApi = (): Web3StorageApi => useMemo(
  () => new Web3StorageApi(web3StorageKey),
  []
);
