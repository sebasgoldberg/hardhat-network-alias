import { task, types } from "hardhat/config"
import "@nomiclabs/hardhat-ethers";

import { extendConfig, extendEnvironment } from "hardhat/config";
import { lazyObject } from "hardhat/plugins";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";

// This import is needed to let the TypeScript compiler know that it should include your type
// extensions in your npm package's types file.
import "./type-extensions";
import { IExternalAliasForNetwork } from "./type-extensions";
import { External } from "./External";

import path from "path";
import axios from "axios";

extendConfig(
  (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
    // We apply our default config here. Any other kind of config resolution
    // or normalization should be placed here.
    //
    // `config` is the resolved config, which will be used during runtime and
    // you should modify.
    // `userConfig` is the config as provided by the user. You should not modify
    // it.
    //
    // If you extended the `HardhatConfig` type, you need to make sure that
    // executing this function ensures that the `config` object is in a valid
    // state for its type, including its extensions. For example, you may
    // need to apply a default value, like in this example.

    const pathDefined = userConfig.external && userConfig.external.path
    const aliasesDefined = userConfig.external && userConfig.external.networkAliases

    const externalPath = userConfig.external?.path as string

    config.external = {
        path: pathDefined ? 
            path.isAbsolute(externalPath) ?
            externalPath
                : path.normalize(path.join(config.paths.root, externalPath))
            : path.join(config.paths.root, "external"),
        networkAliases: aliasesDefined ?
            userConfig.external.networkAliases as IExternalAliasForNetwork
            : {}
    }

    // Adding models location to be considered by typechain.

    interface ITypechainConfig {
        typechain?: {
            externalArtifacts?: string[]
        }
    }

    const typechainConfig = config as ITypechainConfig

    if (typechainConfig.typechain){

        const externalArtifactsPath = `${ config.external.path }/**/model/*.json`

        if (typechainConfig.typechain.externalArtifacts){
            typechainConfig.typechain.externalArtifacts.push(externalArtifactsPath)
        } else {
            typechainConfig.typechain.externalArtifacts = [ externalArtifactsPath ]
        }
    }

  }
);

extendEnvironment((hre) => {
  // We add a field to the Hardhat Runtime Environment here.
  // We use lazyObject to avoid initializing things until they are actually
  // needed.
  hre.external = lazyObject(() => new External(hre));
});

task(
    "external-add-model",
    "Save the ABI obtained from API, using ${address}, into contracts/abi/${filename}.json file.",
    async ({ domain, model, group, address, instance, instanceaddress }, hre) => {

        const apiKey = process.env.BLOCKCHAIN_EXPLORER_API_KEY

        const { 
            result
        } = (await axios.get(`https://${domain}/api?module=contract&action=getabi&address=${address}${ apiKey ? `&apiKey=${apiKey}` : '' }`)
            ).data

        hre.external.saveModel({
            modelName: model,
            modelGroup: group,
            abiAddress: address,
            abi: JSON.parse(result),
        })

        hre.external.saveInstance({
            instanceAddress: instanceaddress || address,
            instanceName: instance,
            modelGroup: group,
            modelName: model
        })

        await hre.run('typechain')

    }
)
    .addOptionalParam("domain", "API domain", "api.snowtrace.io", types.string )
    .addParam("model", "Model name.")
    .addOptionalParam("group", "The model group name.")
    .addParam("address", "The address of the contract from where to obtain the abi.")
    .addOptionalParam("instance", "The instance name used to register the address with the model.")
    .addOptionalParam("instanceaddress", "Used for the instance instead of address parameter.")

task(
    "external-add-instance",
    "Save the ABI obtained from API, using ${address}, into contracts/abi/${filename}.json file.",
    async ({ instance, model, group, address }, hre) => {

        hre.external.saveInstance({
            modelName: model,
            modelGroup: group,
            instanceAddress: address,
            instanceName: instance,
        })

        await hre.run('typechain')

    }
)
    .addParam("instance", "Instance name.")
    .addOptionalParam("model", "Model name.")
    .addOptionalParam("group", "The model group name.")
    .addParam("address", "The address of the contract instance.")
