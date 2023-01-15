const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEX", () => {
  let tokenSupply = "100";
  let token;
  let dex;
  let price = 100;
  let owner;
  let addr1;
  let addr2;

  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(tokenSupply);

    const DEX = await ethers.getContractFactory("DEX");
    dex = await DEX.deploy(token.address, price);
  });

  describe("Selling", () => {
    it("Should fail if contract is not approved", async () => {
      await expect(dex.sell()).to.be.reverted;
    });

    it("Should allow dex to transfer tokens", async () => {
      await token.approve(dex.address, 100);
    });

    it("Should not allow a non owner to call the sell()", async () => {
      await expect(dex.connect(addr1).sell()).to.be.reverted;
    });

    it("Should sell transfer tokens from owner to contract", async () => {
      await expect(dex.sell()).to.changeTokenBalances(
        token,
        [owner.address, dex.address],
        [-100, 100]
      );
    });
  });

  describe("Getters", () => {
    it("Should returnb correct token balance", async () => {
      expect(await dex.getTokenBalance()).to.equal(100);
    });

    it("Should returnb correct token price", async () => {
      expect(await dex.getPrice(10)).to.equal(price * 10);
    });
  });

  describe("Buying", () => {
    it("User can buy tokens", async () => {
      await expect(
        dex.connect(addr1).buy(10, { value: 1000 })
      ).to.changeTokenBalances(token, [dex.address, addr1.address], [-10, 10]);
    });

    it("User cannot buy invalid number of tokens", async () => {
      await expect(dex.connect(addr1).buy(91, { value: 9100 })).to.be.reverted;
    });

    it("User cannot buy with invalid value", async () => {
      await expect(dex.connect(addr1).buy(5, { value: 510 })).to.be.reverted;
    });
  });

  describe("Withdraw tokens", () => {
    it("Non owner cannot withdraw tokens", async () => {
      await expect(dex.connect(addr1).withdrawTokens()).to.be.reverted;
    });

    it("Owner can withdraw tokens", async () => {
      await expect(dex.withdrawTokens()).to.changeTokenBalances(
        token,
        [dex.address, owner.address],
        [-90, 90]
      );
    });
  });

  describe("Withdraw funds", () => {
    it("Owner can withdraw token proceeds", async () => {
      await expect(dex.withdrawFunds()).to.changeTokenBalances(
        token,
        [owner.address, dex.address],
        [1000, -1000]
      );
    });
  });
});
