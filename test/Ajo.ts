import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Contract cases", function () {
  
  async function deployContractsInstances() {
    
  
    const [owner, otherAccount] = await ethers.getSigners();

    const WCXTOKEN = await ethers.getContractFactory("WCXTOKEN");
    const token = await WCXTOKEN.deploy();

    const Ajo = await ethers.getContractFactory("Ajo");
    const ajo = await Ajo.deploy(token.target);

    return { token, ajo, owner, otherAccount };
  }

  describe("Contracts Deployments", function () {
    it("Should pass if WCXTOKEN contract has deployed succesffully", async function () {
      const { token } = await loadFixture(deployContractsInstances);

      expect(token).to.exist;
    });
    it("Should pass if Ajo contract has deployed succesffully", async function () {
      const { ajo } = await loadFixture(deployContractsInstances);

      expect(ajo).to.exist;
    });
  });

  describe("Deposit TOKEN", function () {
    it("Should pass with revertedWithCustomError, when attempted to deposit with amount equal 0", async function () {
      const { ajo } = await loadFixture(deployContractsInstances);
      const tx = ajo.depositToken(0)
      expect(tx).to.be.revertedWithCustomError;
    })

    it("Should pass with revertedWithCustomError from WCXTOKEN, when attempted to deposit without approval to spend token or having token type", async function () {
      const { ajo } = await loadFixture(deployContractsInstances);
      const tx = ajo.depositToken(100)
      //  ERC20InsufficientAllowance
      expect(tx).to.be.revertedWithCustomError;
    })

    it("Should pass an emit after successful transaction", async function () {
      const { ajo, token } = await loadFixture(deployContractsInstances);
      await token.approve(ajo.target, 100)
      const tx = ajo.depositToken(100)

      expect(tx).to.emit;
    })

    it("Should increase user's token in ajo on safe deposit", async function () {
      const { ajo, token, owner } = await loadFixture(deployContractsInstances);
      await token.approve(ajo.target, 100)
      await ajo.depositToken(50)
      const bal = await ajo.checkSavings(ajo.target, 1)
      expect(bal).to.equal(50);
    })

    it("Should pass with revertedWithCustomError, when attempted to deposit with amount greater than users owned token", async function () {
      const { ajo, token, owner } = await loadFixture(deployContractsInstances);
      await token.approve(ajo.target, 100)
      const tx = ajo.depositToken(1000)
      expect(tx).to.be.revertedWithCustomError;
    })
  })
  describe("Withdraw TOKEN", function () {
    it("Should pass with revertedWith, when attempted to withdraw amount equal 0", async function () {
      const { ajo, token } = await loadFixture(deployContractsInstances);
      await token.approve(ajo.target, 100)
      const tx = ajo.depositToken(100)
      expect(tx).to.be.revertedWithCustomError;
    })
  })

  describe("Withdraw ETHER", function () {
    it("Should be able to withdraw all and render savings balance zero", async function () {
      const { ajo } = await loadFixture(deployContractsInstances);
      // Send 1 ETH
      const depositTx = await ajo.depositEthers({ value: ethers.parseEther("1") });
      //   withdraw all ETH
      const balance = await ajo.withdrawEthers()
      expect(balance.value).to.equal(0);
    })
    
  })

  describe("Deposit ETHER", function () {
    it("Should pass with revertedWithCustomError, when attempted to deposit with amount equal 0", async function () {
      const { ajo } = await loadFixture(deployContractsInstances);
      const tx = ajo.depositEthers({value: ethers.parseEther("0")})
      expect(tx).to.be.revertedWithCustomError;
    })
    it("Should be able to deposit", async function () {
      const { ajo } = await loadFixture(deployContractsInstances);
       // deposit 1wei
          const depositTx = await ajo.depositEthers({value:1});
          const balance = await ajo.checkContractBal()
          expect(balance).to.equal(1);
        });
    })
})