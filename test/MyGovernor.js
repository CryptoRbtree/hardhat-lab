const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-network-helpers");
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  const { expect } = require("chai");
  
  describe("MyGovernor", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshopt in every test.
    async function deploy() {
      // Contracts are deployed using the first signer/account by default
      const [owner, account1, account2] = await ethers.getSigners();

      const TimeLock = await ethers.getContractFactory("TimelockController");
      const timelock = await TimeLock.deploy(0, [], []);

      const Token = await ethers.getContractFactory("MyGovernanceToken");
      const token = await Token.deploy(1000);
  
      const Governor = await ethers.getContractFactory("MyGovernor");
      const governor = await Governor.deploy(token.address, timelock.address);
  
      return { governor, token, timelock, owner, account1 };
    }

    async function mineNBlocks(n) {
        for (let index = 0; index < n; index++) {
          await ethers.provider.send('evm_mine');
        }
    }
  
    describe("Propose", function () {
        it("propose, vote and execute", async function () {
            const { governor, token, timelock, owner, account1 } = await loadFixture(deploy);

            const propRole = "0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1";
            const execRole = "0xd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e63";
            timelock.grantRole(propRole, governor.address);
            timelock.grantRole(execRole, governor.address);
            //timelock.grantRole(propRole, account1.address);
            timelock.grantRole(execRole, account1.address);

            await owner.sendTransaction({
                to: timelock.address,
                value: ethers.utils.parseEther("2.0"),
                gasLimit: 80000
            });
            expect(await ethers.provider.getBalance(timelock.address)).to.equal(ethers.utils.parseEther("2.0"));

            const Pending = 0;
            const Active = 1;
            const Canceled = 2;
            const Defeated = 3;
            const Succeeded = 4;
            const Queued = 5;
            const Expired = 6;
            const Executed = 7;
        
            await expect(token.delegate(owner.address)).to.emit(token, "DelegateChanged");
            expect(await token.getVotes(owner.address)).to.equal(1000);

            const tx = await governor.connect(account1)["propose(address[],uint256[],bytes[],string)"]([account1.address], [ethers.utils.parseEther("0.88")], [[]], "Proposal #1: send 0.88eth to me!");

            const receipt = await tx.wait()
            var proposalId = 0;
            for (const event of receipt.events) {
                //console.log(`Event ${event.event} with args ${event.args}`);
                if (event.event == "ProposalCreated") {
                    proposalId = event.args.proposalId;
                }
            }
            expect(proposalId).not.to.equal(0);

            expect(await governor.state(proposalId)).to.equal(Pending);

            mineNBlocks(2);
            expect(await governor.state(proposalId)).to.equal(Active);

            await expect(governor.castVote(proposalId, 1)).to.emit(governor, "VoteCast");
            mineNBlocks(2);
            expect(await governor.state(proposalId)).to.equal(Succeeded);

            const descriptionHash = "0xb99d781745dfccec23640714f21d53aaef1046b164da178660f58812e09332b0";
            const predecessor = "0x0000000000000000000000000000000000000000000000000000000000000000";

            //await expect(timelock.connect(account1).scheduleBatch([account1.address], [ethers.utils.parseEther("0.88")], [[]], predecessor, descriptionHash, 0)).to.emit(timelock, "CallScheduled");
            await expect(governor["queue(address[],uint256[],bytes[],bytes32)"]([account1.address], [ethers.utils.parseEther("0.88")], [[]], descriptionHash)).to.emit(governor, "ProposalQueued");
            expect(await governor.state(proposalId)).to.equal(Queued);

            await expect(timelock.connect(account1).executeBatch([account1.address], [ethers.utils.parseEther("0.88")], [[]], predecessor, descriptionHash)).to.emit(timelock, "CallExecuted");
            //await expect(governor["execute(address[],uint256[],bytes[],bytes32)"]([account1.address], [ethers.utils.parseEther("0.88")], [[]], descriptionHash)).to.emit(governor, "ProposalExecuted");
            expect(await governor.state(proposalId)).to.equal(Executed);

        });
    });
  });
  
  
  