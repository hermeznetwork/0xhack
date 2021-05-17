const path = require("path");
const ethers = require("ethers");

const hermez = require("@hermeznetwork/hermezjs")
require("dotenv").config({ path: path.join(__dirname, "../config/.env")});

async function main () {
    // load enviornment vars
    const pvtKey = process.env.ETHEREUM_PVT_KEY;
    const ethNodeUrl = process.env.ETHEREUM_NODE_URL;
    const tokenSymbol = process.env.TOKEN_SYMBOL;
    const amountDeposit = process.env.AMOUNT_DEPOSIT;

    // setup environment and provider
    const provider = new ethers.providers.JsonRpcProvider(ethNodeUrl);
    const chainID = (await provider.getNetwork()).chainId;

    hermez.Environment.setEnvironment(chainID);
    hermez.Providers.setProvider(ethNodeUrl);

    // create wallet from ethereum account
    const signer = { type: 'WALLET', privateKey: pvtKey };
    const hermezWallet = (await hermez.HermezWallet.createWalletFromEtherAccount(ethNodeUrl, signer)).hermezWallet;

    // setup token to be deposit
    const allHermezTokensInfo = await hermez.CoordinatorAPI.getTokens();
    console.log("List tokens available on Hermez: ", allHermezTokensInfo);

    const tokenInfo = allHermezTokensInfo.tokens.filter(element => element.symbol === tokenSymbol)[0];
    console.log(`Token ${tokenInfo.symbol} information: `, tokenInfo);

    // setup amount to deposit
    const amountDepositBigInt = hermez.Utils.getTokenAmountBigInt(amountDeposit, tokenInfo.decimals);
    const amountCompressedDeposit = hermez.HermezCompressedAmount.compressAmount(amountDepositBigInt);

    // perform deposit
    const tx = await hermez.Tx.deposit(
        amountCompressedDeposit,
        hermezWallet.hermezEthereumAddress,
        tokenInfo,
        hermezWallet.publicKeyCompressedHex,
        signer
    );
    console.log("Transaction hash: \n\n", tx.hash);
    const receipt = await tx.wait();
    console.log("Receipt: ", receipt);
}

main();
