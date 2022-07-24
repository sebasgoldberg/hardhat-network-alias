// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";
import path from "path";
import { External } from "../src/External";


import { useEnvironment } from "./helpers";

describe("Integration tests examples", function () {
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

    it("Should add the external field", function () {
      assert.instanceOf(
        this.hre.external,
        External
      );
    });

  });

  describe("HardhatConfig extension", function () {
    useEnvironment("hardhat-project");

    it("Should add the external.path and the external.networkAliases to the config", function () {
      assert.equal(
        this.hre.config.external.path,
        path.join(process.cwd(), "external")
      );
      assert.equal(
        this.hre.config.external.networkAliases['localhost'],
        'hardhat'
      );
    });
  });
});
