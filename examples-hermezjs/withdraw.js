const path = require("path");
const ethers = require("ethers");

const hermez = require("@hermeznetwork/hermezjs")
require("dotenv").config({ path: path.join(__dirname, "../config/.env")});

async function main () {
    // load environment vars
    const pvtKey = process.env.ETHEREUM_PVT_KEY;
    const ethNodeUrl = process.env.ETHEREUM_NODE_URL;
    const tokenSymbol = process.env.TOKEN_SYMBOL;

    // setup environment and provider
    const provider = new ethers.providers.JsonRpcProvider(ethNodeUrl);
    const chainID = (await provider.getNetwork()).chainId;

    hermez.Environment.setEnvironment(chainID);
    hermez.Providers.setProvider(ethNodeUrl);

    // create wallet from ethereum account
    const signer = { type: 'WALLET', privateKey: pvtKey };
    const hermezWallet = (await hermez.HermezWallet.createWalletFromEtherAccount(ethNodeUrl, signer)).hermezWallet;

    // setup token
    const allHermezTokensInfo = await hermez.CoordinatorAPI.getTokens();
    const tokenInfo = allHermezTokensInfo.tokens.filter(element => element.symbol === tokenSymbol)[0];

    // get information sender
    const accountsInfo = await hermez.CoordinatorAPI.getAccounts(hermezWallet.hermezEthereumAddress);
    const accountInfo = accountsInfo.accounts.filter(element => element.token.symbol === tokenSymbol)[0];

    // get exit information
    const exitsInfo = (await hermez.CoordinatorAPI.getExits(hermezWallet.hermezEthereumAddress, true)).exits;
    console.log("All pending exits: ", exitsInfo);
    const exitInfo = exitsInfo.filter(exit => exit.accountIndex == accountInfo.accountIndex)[0];
    console.log(`\n\nWithdrawal from ${accountInfo.accountIndex}: \n`, exitInfo);

    // perform withdraw
    const tx = await hermez.Tx.withdraw(
        exitInfo.balance,
        accountInfo.accountIndex,
        tokenInfo,
        hermezWallet.publicKeyCompressedHex,
        exitInfo.batchNum,
        exitInfo.merkleProof.siblings,
        true,
        signer
      );
    console.log("Transaction hash: \n\n", tx.hash);
    const receipt = await tx.wait();
    console.log("Receipt: ", receipt);
}

main();
