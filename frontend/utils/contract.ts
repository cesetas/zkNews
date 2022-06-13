import Web3 from "web3";
import config from "./config.json";
import zkNews from "../../contracts/artifacts/contracts/zkNews.sol/zkNews.json";
import { AbiItem } from "web3-utils";

const getContract = async () => {
  const RPC_URL = process.env.RPC_URL;
  const PTE_KEY = process.env.PRIVATE_KEY;

  const web3 = new Web3(RPC_URL as string);
  web3.eth.handleRevert = true; // return custom error messages from contract

  let mainAccount = web3.eth.accounts.privateKeyToAccount(PTE_KEY as string);
  web3.eth.accounts.wallet.add(mainAccount);
  web3.eth.defaultAccount = mainAccount.address;

  const contract = new web3.eth.Contract(
    zkNews.abi as AbiItem[],
    config.CONTRACT_ADDRESS
  );
  return { contract, account: web3.eth.defaultAccount };
};

export { getContract };
