const path = require("path");
const ethers = require("ethers");

const hermez = require("@hermeznetwork/hermezjs")
require("dotenv").config({ path: path.join(__dirname, "../config/.env")});

async function main () {
    // load enviornment vars
    const pvtKey = process.env.ETHEREUM_PVT_KEY;
    const ethNodeUrl = process.env.ETHEREUM_NODE_URL;
    const tokenSymbol = process.env.TOKEN_SYMBOL;
    const amountTransfer = process.env.AMOUNT_TRANSFER;
    const receiver = process.env.RECEIVER;

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

    // setup token to be transfer
    const allHermezTokensInfo = await hermez.CoordinatorAPI.getTokens();
    const tokenInfo = allHermezTokensInfo.tokens.filter(element => element.symbol === tokenSymbol)[0];

    // setup amount to transfer
    const amountTransferBigInt = hermez.Utils.getTokenAmountBigInt(amountTransfer, tokenInfo.decimals);
    const amountCompressedTransfer = hermez.HermezCompressedAmount.compressAmount(amountTransferBigInt);

    // get information sender
    // get sender account information
    const accountsInfo = await hermez.CoordinatorAPI.getAccounts(hermezWallet.hermezEthereumAddress);
    console.log("Account info all tokens: ", accountsInfo);

    const accountInfo = accountsInfo.accounts.filter(element => element.token.symbol === tokenSymbol)[0];
    console.log(`\n\nAccount info for ${tokenInfo.symbol}: `, accountInfo);

    // check receiver has an account authorization message
    try {
        await hermez.CoordinatorAPI.getCreateAccountAuthorization(receiver);
    } catch (error){
        console.error(`Receiver ${receiver} does not have an account authroization message`);
        process.exit(1);
    }

    // setup fee
    const state = await hermez.CoordinatorAPI.getState();
    console.log("General state: ", state);
    const fee = tokenInfo.USD ? state.recommendedFee.existingAccount / tokenInfo.USD : 0;
    console.log(`Fee in ${tokenInfo.symbol}: `, fee);

    // generate L2 transaction
    const l2TxTransfer = {
      from: accountInfo.accountIndex,
      to: receiver,
      amount: amountCompressedTransfer,
      fee: fee
    };

    const transferResponse = await hermez.Tx.generateAndSendL2Tx(
        l2TxTransfer,
        hermezWallet,
        tokenInfo
    );
    console.log("transferResponse: ", transferResponse);
}

main();
