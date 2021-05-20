const path = require("path");
const ethers = require("ethers");

const hermez = require("@hermeznetwork/hermezjs")
require("dotenv").config({ path: path.join(__dirname, "../config/.env")});

async function main () {
    // load environment vars
    const pvtKey = process.env.ETHEREUM_PVT_KEY;
    const ethNodeUrl = process.env.ETHEREUM_NODE_URL;
    const tokenSymbol = process.env.TOKEN_SYMBOL;
    const amountExit = process.env.AMOUNT_EXIT;

    // setup environment and provider
    const provider = new ethers.providers.JsonRpcProvider(ethNodeUrl);
    const chainID = (await provider.getNetwork()).chainId;

    hermez.Environment.setEnvironment(chainID);
    hermez.Providers.setProvider(ethNodeUrl);

    // create wallet from ethereum account
    const signer = { type: 'WALLET', privateKey: pvtKey };
    const hermezWallet = (await hermez.HermezWallet.createWalletFromEtherAccount(ethNodeUrl, signer)).hermezWallet;

    // Initializes Tx Pool
    hermez.TxPool.initializeTransactionPool();

    // setup token
    const allHermezTokensInfo = await hermez.CoordinatorAPI.getTokens();
    const tokenInfo = allHermezTokensInfo.tokens.filter(element => element.symbol === tokenSymbol)[0];

    // setup amount to exit
    const amountExitBigInt = hermez.Utils.getTokenAmountBigInt(amountExit, tokenInfo.decimals);
    const amountCompressedExit = hermez.HermezCompressedAmount.compressAmount(amountExitBigInt);

    // get information sender
    const accountsInfo = await hermez.CoordinatorAPI.getAccounts(hermezWallet.hermezEthereumAddress);
    const accountInfo = accountsInfo.accounts.filter(element => element.token.symbol === tokenSymbol)[0];

    // setup fee
    const state = await hermez.CoordinatorAPI.getState();
    const fee = tokenInfo.USD ? state.recommendedFee.existingAccount / tokenInfo.USD : 0;

    // generate L2 transaction
    const l2TxExit = {
      type: "Exit",
      from: accountInfo.accountIndex,
      amount: amountCompressedExit,
      fee: fee
    };

    const exitResponse = await hermez.Tx.generateAndSendL2Tx(
        l2TxExit,
        hermezWallet,
        tokenInfo
    );
    console.log("exitResponse: ", exitResponse);
}

main();
