import type { ActionController } from '../types';
import type { ServiceProviderRegistry } from 'typechain/registries';
import { utils, Wallet } from 'ethers';
import ora from 'ora';
import { ServiceProviderRegistry__factory } from '../../typechain/factories/registries';
import { getWalletByAccountIndex } from './wallet';
import { green } from '../utils/print';
import { getAddresses, Role } from './addresses';
import { getConfig, requiredConfig, saveConfig } from './config';

export const getServiceProviderId = (
  contract: ServiceProviderRegistry,
  salt: string,
  metadataUri: string,
): Promise<string> =>
  contract.callStatic.enroll(salt, metadataUri);

export const getRegistryContract = (wallet: Wallet): ServiceProviderRegistry => {
  requiredConfig(['registry']);
  return ServiceProviderRegistry__factory.connect(
    getConfig('registry') as string,
    wallet
  );
};

export const registerServiceProvider = async (
  contract: ServiceProviderRegistry,
  salt: string,
  metadataUri: string,
  spinnerCallback: (text: string) => void
): Promise<string> => {
  const addresses = await getAddresses();
  const addressesMap = addresses.reduce(
    (a, v) => ({
      ...a,
      [Number(v.id)]: v.address
    }),
    {}
  );

  const serviceProviderId = await getServiceProviderId(
    contract,
    salt,
    metadataUri
  );

  spinnerCallback('Registering of the service provider');
  await contract.enroll(salt, metadataUri);

  spinnerCallback(`Granting ${addressesMap[Role.API]} the API role`);
  await contract.grantRole(
    utils.keccak256(
      utils.solidityPack(
        ['bytes32', 'uint256'],
        [serviceProviderId, Role.API]
      )
    ),
    addressesMap[Role.API]
  );

  spinnerCallback(`Granting ${addressesMap[Role.BIDDER]} the BIDDER role`);
  await contract.grantRole(
    utils.keccak256(
      utils.solidityPack(
        ['bytes32', 'uint256'],
        [serviceProviderId, Role.BIDDER]
      )
    ),
    addressesMap[Role.BIDDER]
  );

  spinnerCallback(`Granting ${addressesMap[Role.MANAGER]} the MANAGER role`);
  await contract.grantRole(
    utils.keccak256(
      utils.solidityPack(
        ['bytes32', 'uint256'],
        [serviceProviderId, Role.MANAGER]
      )
    ),
    addressesMap[Role.MANAGER]
  );

  spinnerCallback(`Granting ${addressesMap[Role.STAFF]} the STAFF role`);
  await contract.grantRole(
    utils.keccak256(
      utils.solidityPack(
        ['bytes32', 'uint256'],
        [serviceProviderId, Role.STAFF]
      )
    ),
    addressesMap[Role.STAFF]
  );

  // await contract.multicall([
  //   // enroll
  //   ServiceProviderRegistry__factory
  //     .createInterface()
  //     .encodeFunctionData('enroll', [salt, metadataUri]),
  //   // api-role
  //   ServiceProviderRegistry__factory
  //     .createInterface()
  //     .encodeFunctionData(
  //       'grantRole',
  //       [
  //         utils.keccak256(
  //           utils.solidityPack(
  //             ['bytes32', 'uint256'],
  //             [serviceProviderId, Role.API]
  //           )
  //         ),
  //         addressesMap[Role.API]
  //       ]
  //     ),
  //   // bidder-role
  //   ServiceProviderRegistry__factory
  //     .createInterface()
  //     .encodeFunctionData(
  //       'grantRole',
  //       [
  //         utils.keccak256(
  //           utils.solidityPack(
  //             ['bytes32', 'uint256'],
  //             [serviceProviderId, Role.BIDDER]
  //           )
  //         ),
  //         addressesMap[Role.BIDDER]
  //       ]
  //     ),
  //   // manager-role
  //   ServiceProviderRegistry__factory
  //     .createInterface()
  //     .encodeFunctionData(
  //       'grantRole',
  //       [
  //         utils.keccak256(
  //           utils.solidityPack(
  //             ['bytes32', 'uint256'],
  //             [serviceProviderId, Role.MANAGER]
  //           )
  //         ),
  //         addressesMap[Role.MANAGER]
  //       ]
  //     ),
  //   // staff-role
  //   ServiceProviderRegistry__factory
  //     .createInterface()
  //     .encodeFunctionData(
  //       'grantRole',
  //       [
  //         utils.keccak256(
  //           utils.solidityPack(
  //             ['bytes32', 'uint256'],
  //             [serviceProviderId, Role.STAFF]
  //           )
  //         ),
  //         addressesMap[Role.STAFF]
  //       ]
  //     )
  // ]);

  return serviceProviderId;
};

export const serviceProviderController: ActionController = async ({ salt, meta, register }, program) => {
  const spinner = ora('Registering of the service provider...');

  try {
    requiredConfig(['defaultAccountIndex']);

    const wallet = getWalletByAccountIndex(
      getConfig('defaultAccountIndex') as number
    );
    const contract = getRegistryContract(wallet);

    if (!salt) {
      requiredConfig(['salt']);
      salt = getConfig('salt') as string;
    }

    if (!meta) {
      requiredConfig(['metadataUri']);
      meta = getConfig('metadataUri') as string;
    }

    let serviceProviderId: string;

    if (register) {
      spinner.start();

      const serviceProviderId = await registerServiceProvider(
        contract,
        salt,
        meta,
        text => {
          spinner.text = text;
        }
      );

      saveConfig('salt', salt);
      saveConfig('metadataUri', meta);
      saveConfig('serviceProviderId', serviceProviderId);

      spinner.stop();

      green(
        `Service provider with Id: ${serviceProviderId} has been successfully registered`
      );
    } else {
      requiredConfig(['serviceProviderId']);
      serviceProviderId = getConfig('serviceProviderId') as string;
      salt = getConfig('salt') as string;
      meta = await contract.datastores(serviceProviderId);
      const owner = await wallet.getAddress();

      spinner.stop();

      green(`Service provider Id: ${serviceProviderId}`);
      green(`Unique salt string: ${salt}`);
      green(`Metadata storage Id: ${meta}`);
      green(`Owner address: ${owner}`);
    }
  } catch (error) {
    spinner.stop();
    program.error(error, { exitCode: 1 });
  }
};
