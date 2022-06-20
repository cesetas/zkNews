import React from "react";
import { useState, useEffect } from "react";
import { Strategy, ZkIdentity } from "@zk-kit/identity";
import detectEthereumProvider from "@metamask/detect-provider";
import { generateMerkleProof, Semaphore } from "@zk-kit/protocols";
import { ethers, providers, Contract } from "ethers";
import {
  Button,
  Typography,
  Container,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material/";
import Link from "next/link";
import { useWeb3Contract } from "react-moralis";
import { contractAddresses, abi } from "../constants";
import { useMoralis } from "react-moralis";
import { AbiItem } from "web3-utils";
import { useNotification } from "web3uikit";

const URL = process.env.NEXT_PUBLIC_LOC_RPC_URL;
const KEY = process.env.NEXT_PUBLIC_LOC_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const login = () => {
  // const [identityCommitment, setIdentityCommitment] = useState(null);
  const [connectWallet, setConnectWallet] = useState("");
  const [isLoging, setIsLoging] = useState(false);
  // const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [identityStatus, setIdentityStatus] = useState(false);

  // const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis();
  // // These get re-rendered every time due to our connect button!
  // const chainId = parseInt(chainIdHex);
  // // console.log(`ChainId is ${chainId}`)
  // const zkNewsAddress =
  //   chainId in contractAddresses ? contractAddresses[chainId][0] : null;

  const zkNewsAddress = contractAddresses.localhost;

  // const {
  //   runContractFunction: insertIdentityAsClient,
  //   data: enterTxResponse,
  //   isLoading,
  //   isFetching,
  // } = useWeb3Contract({
  //   abi: abi,
  //   contractAddress: zkNewsAddress,
  //   functionName: "insertIdentityAsClient",
  //   params: {
  //     _leaf:identityCommitment,
  //   },
  // });

  const handleLogin = async () => {
    setIsLoging(true);
    // const { ethereum } = window;
    if (!window.ethereum) {
      alert("Install metamask");
      setIsLoging(false);
      return;
    }

    const provider = (await detectEthereumProvider()) as any;

    await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();

    const message = await signer.signMessage(
      "Sign this message to create your identity!"
    );

    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();

    // let currentIdentityCommitments = [];
    // const res = await fetch("http://localhost:3000/api/identity", {
    //   method: "GET",
    // });

    // if (res.status === 500) {
    //   console.log(res);
    // } else {
    //   currentIdentityCommitments = await res.json();
    // }

    const currentIdentityCommitments = [
      BigInt(1),
      identityCommitment,
      BigInt(2),
    ];

    const merkleProof = generateMerkleProof(
      20,
      BigInt(0),
      currentIdentityCommitments,
      identityCommitment
    );
    console.log(merkleProof);
    console.log("Creating your Semaphore proof...");
    console.log("9");
    const signal = "registration";

    const witness = Semaphore.genWitness(
      identity.getTrapdoor(),
      identity.getNullifier(),
      merkleProof,
      merkleProof.root,
      signal
    );
    console.log("10");

    const { proof, publicSignals } = await Semaphore.genProof(
      witness,
      "./semaphore.wasm",
      "./semaphore_final.zkey"
    );
    console.log(proof);
    console.log("10");
    console.log(publicSignals);
    console.log("10");
    const solidityProof = Semaphore.packToSolidityProof(proof);
    console.log("11");
    console.log(solidityProof);
    const response = await fetch("/api/nullifier", {
      method: "POST",
      body: JSON.parse(
        JSON.stringify({
          signal,
          nullifierHash: publicSignals.nullifierHash,
          solidityProof: solidityProof,
          root: merkleProof.root,
          externalNullifier: publicSignals.externalNullifier,
        })
      ),
    });
    console.log("12");
    if (response.status === 500) {
      const errorMessage = await response.text();
      console.log(errorMessage);
    } else {
      try {
        const zkNewsContract = new ethers.Contract(zkNewsAddress, abi, signer);
        const tx = await zkNewsContract.insertIdentityAsClient(
          ethers.BigNumber.from(identityCommitment)
        );
        // await tx.wait(1);
        setIsStatusChanged(true);
        setIdentityStatus(false);
        setStatus("Your account have been registered successfully");
      } catch (error) {
        console.log(error);
      }
    }

    // const isIdentityIncludedBefore = currentIdentityCommitments.includes(
    //   identityCommitment.toString()
    // );

    // if (isIdentityIncludedBefore) {
    //   setIsLoging(false);
    //   setIsStatusChanged(true);
    //   setIdentityStatus(true);
    //   setStatus(
    //     "This account has already been registered before. Please try it again with another one"
    //   );
    //   return;
    // } else {}

    setIsLoging(false);
  };

  return (
    <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
      <Box
        sx={{
          width: 600,
          height: "auto",
          backgroundColor: "light.gray",
        }}
      >
        {!isStatusChanged ? (
          <></>
        ) : (
          <>
            <Alert severity={identityStatus ? "error" : "success"}>
              {status}
            </Alert>
          </>
        )}
        <Typography gutterBottom variant="h5" component="div">
          zKNews Registration
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Become our journalist/subscriber
        </Typography>

        {isLoging ? (
          <CircularProgress />
        ) : (
          <>
            <Button onClick={handleLogin} size="small">
              Login
            </Button>
          </>
        )}
        {isStatusChanged ? (
          <>
            <Link href="/news">
              <Button color="inherit" size="small">
                Explore the news
              </Button>
            </Link>
            <Link href="/postnews">
              <Button size="small">Post news</Button>
            </Link>
          </>
        ) : (
          <></>
        )}
      </Box>
    </Container>
  );
};

export default login;
