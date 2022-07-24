# hardhat-external-plugin

This plug-in it is used to add external contract already deployed dependencies to the project.

[Hardhat](https://hardhat.org) external plugin. 

## What

This plugin will help you with:
- For verified contracts it is possible to fetch abi from blockchain explorer and register as a model.
- Once registered a model, it is possible to register multiple instances (contract addreses) for a model.
- For each model it is possible to generate typechain classes.

## Installation

```bash
npm install @sebasgoldberg/hardhat-external
```

Import the plugin in your `hardhat.config.js`:

```js
require("@sebasgoldberg/hardhat-external");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "@sebasgoldberg/hardhat-external";
```


## Optional plugins

- [@typechain/hardhat](https://github.com/dethcrypto/TypeChain/tree/master/packages/hardhat)


## Tasks

### external-add-model

In the following example we register the model `BridgeToken` using the abi found in the address `0xd586E7F844cEa2F87f50152665BCbc2C279D8d70`.
This model is registered in the `test` group (the group is optional).
Aditionally, at the same time it is registered an instance `BridgeDAIe`, that it is going to use the same address, and the model `BridgeToken`.

`$ npx hardhat external-add-model --address 0xd586E7F844cEa2F87f50152665BCbc2C279D8d70 --group test --instance BridgeDAIe --model BridgeToken`

### external-add-instance

In case we want to register multiple instance with the same model, we use `external-add-instance`.

In the following example we register an instance `BridgeWETHe`, that it is going to use the address `0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB`, and the model `BridgeToken`.
Note that to be possible to find the `BridgeToken` model, it is necessary to pass the group `test` as a parameter.

`$ npx hardhat external-add-instance --instance BridgeWETHe --model BridgeToken --group test --address 0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB`


## Environment extensions

This plugin extends the Hardhat Runtime Environment by adding an `external` field
whose type is `External`.

To get the `Contract` instance for both instances registered above, we simply do the following:

``` typescript
import { BridgeToken } from '../typechain-types'
// ...
const BridgeWETHe: BridgeToken = hre.external.getContract('BridgeWETHe', 'test') as BridgeToken
const BridgeDAIe: BridgeToken = hre.external.getContract('BridgeDAIe', 'test') as BridgeToken
```

Note that we are using the specific contract type `BridgeToken` generated using typechain.

## Configuration

The models are created for each network (defined in taks using --network parameter).

In case the models registered for one network are the same for another network, it is possible to specify this with an alias.

In the following example, the models are registered for the `hardhat` network, and we want to use the same models for the `localhost` network.

``` typescript
const config: HardhatUserConfig = {
  // ...
  external:{
    networkAliases: {
      'localhost': 'hardhat'
    }
  },
  // ...
```

Additionally, by default all information related to models and instances are saved in the `external` folder.

If you need to change the path of this folder you can specify a relative or an absolute path:

``` typescript
const config: HardhatUserConfig = {
  // ...
  external:{
    path: 'other/location/for/external/plugin'
  },
  // ...
```
