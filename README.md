# HermezJS examples
Scripts to perform basic actions using `hermezjs` that have been shown on 0xHack workshop
All examples are in `examples-hermezjs` folder

## Examples list
- `set-environment.js`
  - description: sets hermezjs environment variables depending on chainID
  - requirements:
    - ethereum node url
- `create-wallet.js`
  - description: creates a standard hermez wallet, an internal hermez wallet and creates an account authorization message
  - requirements:
    - ethereum node url
    - ethereum private key
- `deposit.js`
  - description: performs deposit in hermez network through smart contract hermez interaction. This action will create an hermez account
  - requirements:
    - ethereum node url
    - ethereum private key
    - token to be deposited
    - `ether`
- `transfer.js`
  - description: performs a L2 transfer in hermez network
  - requirements:
    - ethereum node url
    - ethereum private key
    - hermez account
    - enough balance on L2
- `exit.js`
  - description: performs a L2 exit in hermez network. This action moves funds from L2 to L1 hermez smart contract, ready to be claimed by the user in the following step `withdraw`
  - requirements:
    - ethereum node url
    - ethereum private key
    - hermez account
    - enough balance on L2
- `withdraw.js`
  - description: Claim funds from an exit L2 transaction. This action will move funds from hermez contract to user ethereum account
  - requirements:
    - ethereum node url
    - ethereum private key
    - hermez account
    - pending `exit`
    - `ether`

## Configuration parameters
- `ETHEREUM_NODE_URL`: ethereum node url
- `ETHEREUM_PVT_KEY`: ethereum private key
- `TOKEN_SYMBOL`: token symbol to be used in the examples (example: `ETH`)
- `AMOUNT_DEPOSIT`: amount to be deposited from ethereum to hermez network (taking into account token decimals) (example: `0.042`)
- `AMOUNT_TRANSFER`: amount to be transfered between hermez accounts (taking into account token decimals) (example: `0.014`)
- `AMOUNT_EXIT`: amount to exit from hermez network to hermez contract (taking into account token decimals) (example: `0.014`)
- `RECEIVER`: hermez account receiver for the hermez network transfer (example: `hez:0xa7Db86d226235B9eaF38d742A32D0CBD4FB187Cc`)