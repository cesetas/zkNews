import Web3 from "web3";
// import config from "./config.json";
import zkNews from "../../contracts/artifacts/contracts/zkNews.sol/zkNews.json";
import { AbiItem } from "web3-utils";
import "dotenv/config";
import { contractAddresses, config } from "../constants";
import abi from "../../contracts/artifacts/contracts/zkNews.sol/zkNews.json";

const getContract = async () => {
  const PTE_KEY = config.LOC_PRIVATE_KEY;
  const URL = config.LOC_URL;
  const zkNewsAddress = contractAddresses.localhost;

  const web3 = new Web3(URL as string);
  web3.eth.handleRevert = true; // return custom error messages from contract

  let mainAccount = web3.eth.accounts.privateKeyToAccount(PTE_KEY as string);
  web3.eth.accounts.wallet.add(mainAccount);
  web3.eth.defaultAccount = mainAccount.address;

  const contract = new web3.eth.Contract(abi.abi as AbiItem[], zkNewsAddress);
  return { contract, account: web3.eth.defaultAccount };
};

export { getContract };