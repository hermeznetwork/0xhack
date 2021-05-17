const path = require("path");
const ethers = require("ethers");

const hermez = require("@hermeznetwork/hermezjs")
require("dotenv").config({ path: path.join(__dirname, "../config/.env")});

async function main () {
    // load enviornment vars
    const pvtKey = process.env.ETHEREUM_PVT_KEY;
    const ethNodeUrl = process.env.ETHEREUM_NODE_URL;

    // setup environment and provider
    const provider = new ethers.providers.JsonRpcProvider(ethNodeUrl);
    const chainID = (await provider.getNetwork()).chainId;

    hermez.Environment.setEnvironment(chainID);
    hermez.Providers.setProvider(ethNodeUrl);

    // create wallet from ethereum account
    const signer = { type: 'WALLET', privateKey: pvtKey };
    const walletFromEth = await hermez.HermezWallet.createWalletFromEtherAccount(ethNodeUrl, signer);
    const hermezWalletFromEth = walletFromEth.hermezWallet;

    console.log("Hermez wallet from ethereum account: ");
    console.log(`   publicKey: ${hermezWalletFromEth.publicKey}`);
    console.log(`   publicKeyCompressed: ${hermezWalletFromEth.publicKeyCompressed}`);
    console.log(`   publicKeyCompressedHex: ${hermezWalletFromEth.publicKeyCompressedHex}`);
    console.log(`   publicKeyBase64: ${hermezWalletFromEth.publicKeyBase64}`);
    console.log(`   hermezEthereumAddress: ${hermezWalletFromEth.hermezEthereumAddress}`);

    // create internal wallet from bjj private key
    const pvtKeyBjj = Buffer.allocUnsafe(32).fill('0');;
    const walletFromBjj = await hermez.HermezWallet.createWalletFromBjjPvtKey(pvtKeyBjj);
    const hermezWalletFromBjj = walletFromBjj.hermezWallet;

    console.log("\n\nHermez wallet from Bjj key: ");
    console.log(`   publicKey: ${hermezWalletFromBjj.publicKey}`);
    console.log(`   publicKeyCompressed: ${hermezWalletFromBjj.publicKeyCompressed}`);
    console.log(`   publicKeyCompressedHex: ${hermezWalletFromBjj.publicKeyCompressedHex}`);
    console.log(`   publicKeyBase64: ${hermezWalletFromBjj.publicKeyBase64}`);
    console.log(`   hermezEthereumAddress: ${hermezWalletFromBjj.hermezEthereumAddress}\n\n`);

    // crete account authorization
    try {
        await hermez.CoordinatorAPI.getCreateAccountAuthorization(hermezWalletFromEth.hermezEthereumAddress);
        console.log(`${hermezWalletFromEth.hermezEthereumAddress} has already an account authorization`);
    } catch (error){
        const signature = await hermezWalletFromEth.signCreateAccountAuthorization(ethNodeUrl, signer);
        const nodeResponse = await hermez.CoordinatorAPI.postCreateAccountAuthorization(
            hermezWalletFromEth.hermezEthereumAddress,
            hermezWalletFromEth.publicKeyBase64,
            signature
        );
        console.log("nodeResponse: ");
        console.log(    `status: ${nodeResponse.value.status}`);
        console.log(    `statusText: ${nodeResponse.value.statusText}`);
    }
}

main();
