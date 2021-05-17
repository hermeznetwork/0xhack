const path = require("path");
const ethers = require("ethers");

const hermez = require("@hermeznetwork/hermezjs")
require("dotenv").config({ path: path.join(__dirname, "../config/.env")});

async function main () {
    // load enviornment vars
    const ethNodeUrl = process.env.ETHEREUM_NODE_URL;
    console.log(ethNodeUrl);

    // get current environment
    let environment = hermez.Environment.getCurrentEnvironment();
    console.log("Default environment:", environment);

    // switch to environment depending on chainID
    const provider = new ethers.providers.JsonRpcProvider(ethNodeUrl);
    const network = await provider.getNetwork();
    const chainID = network.chainId;

    hermez.Environment.setEnvironment(chainID);

    environment = hermez.Environment.getCurrentEnvironment();
    console.log(`\n\nEnvironment ${chainID}: `, environment);

    // set provider
    hermez.Providers.setProvider(ethNodeUrl);
}

main();
