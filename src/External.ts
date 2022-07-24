import fs from 'fs'
import { HardhatRuntimeEnvironment } from "hardhat/types";
import ethers from "ethers"


interface IExternalModel{
    modelName: string,
    modelGroup: string,
    abiAddress: string,
    abi: ethers.utils.Fragment[]
}

interface IExternalInstance{
    instanceName: string,
    instanceAddress: string,
    modelName: string,
    modelGroup: string,
}

export class External{

    constructor(protected hre: HardhatRuntimeEnvironment){

    }

    protected getNetworkName(networkNameOrAlias: string): string{
        return ( this.hre.config.external.networkAliases[networkNameOrAlias] ?
            this.hre.config.external.networkAliases[networkNameOrAlias] :
            networkNameOrAlias
        )
    }

    protected getExternalModelPath(group: string|undefined): string {
        const { network } = this.hre
        return `${ this.hre.config.external.path }/${this.getNetworkName(network.name)}${ group ? `/${group}` : ''}/model/`
    }
    
    protected getExternalInstancePath(group: string|undefined): string {
        const { network } = this.hre
        return `${ this.hre.config.external.path }/${this.getNetworkName(network.name)}${ group ? `/${group}` : ''}/instance`
    }

    protected getExternalModelFilename(modelName: string, group: string|undefined): string {
        const dirname = this.getExternalModelPath(group)
        return `${dirname}/${modelName}.json`
    }
    
    protected getExternalInstanceFilename(instanceName: string, group: string|undefined): string {
        const dirname = this.getExternalInstancePath(group)
        return `${dirname}/${instanceName}.json`
    }


    protected getModel(name: string, group?: string): IExternalModel {

        const filename = this.getExternalModelFilename(name, group)

        const model: IExternalModel = JSON.parse(fs.readFileSync(filename, "utf-8"))

        return model
    }

    protected getInstance(name: string, group?: string): IExternalInstance {

        const filename = this.getExternalInstanceFilename(name, group)

        const instance: IExternalInstance = JSON.parse(fs.readFileSync(filename, "utf-8"))

        return instance
    }

    /**
     * 
     * @param name Same value used when called register-external-contract task.
     */
     getContract(instanceOrModelName: string, modelGroup?: string, instanceAddress?: string): ethers.Contract {

        if (instanceAddress) {

            const model: IExternalModel = this.getModel(instanceOrModelName, modelGroup)
    
            return new this.hre.ethers.Contract(
                instanceAddress,
                model.abi,
                this.hre.ethers.provider
            )
    
        }

        const instance: IExternalInstance = this.getInstance(instanceOrModelName, modelGroup)

        const model: IExternalModel = this.getModel(instance.modelName, instance.modelGroup)
    
        return new this.hre.ethers.Contract(
            instance.instanceAddress,
            model.abi,
            this.hre.ethers.provider
        )
    
    }

    saveModel(model: IExternalModel){

        const dirname = this.getExternalModelPath(model.modelGroup)

        if (!fs.existsSync(dirname)){
            fs.mkdirSync(dirname, { recursive: true });
        }
    
        const content = JSON.stringify(model, null, 4)

        const filename = this.getExternalModelFilename(model.modelName, model.modelGroup)
    
        fs.writeFileSync(filename, content, "utf-8");
    
    }

    saveInstance(instance: IExternalInstance){

        // Try to get the model to assure it exists
        this.getModel(instance.modelName, instance.modelGroup)

        const dirname = this.getExternalInstancePath(instance.modelGroup)

        if (!fs.existsSync(dirname)){
            fs.mkdirSync(dirname, { recursive: true });
        }
    
        const content = JSON.stringify(instance, null, 4)

        const filename = this.getExternalInstanceFilename(instance.instanceName, instance.modelGroup)
    
        fs.writeFileSync(filename, content, "utf-8");
    
    }

}

