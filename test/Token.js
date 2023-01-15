const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token", () => {
  let tokenSupply = "100";
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy(tokenSupply);
  });

  describe("Deployment", () => {
    it("Should assign total supply of tokens to the owner/deployer", async () => {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", () => {
    it("Should transfer token between accounts", async () => {
      await token.connect(owner.address);
      await token.transfer(addr1.address, 50);
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);
    });

    it("Should transfer token between accounts within its balance", async () => {
      await expect(token.connect(addr1).transfer(addr2.address, 51)).to.be
        .reverted;
    });
  });
});
