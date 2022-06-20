import React from "react";
import { useState, useEffect } from "react";
import { Strategy, ZkIdentity } from "@zk-kit/identity";
import detectEthereumProvider from "@metamask/detect-provider";
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
import { contractAddresses } from "../constants";
import abi from "../../contracts/artifacts/contracts/zkNews.sol/zkNews.json";
import { useMoralis } from "react-moralis";
import { AbiItem } from "web3-utils";
import { useNotification } from "web3uikit";

const URL = process.env.NEXT_PUBLIC_LOC_RPC_URL;
const KEY = process.env.NEXT_PUBLIC_LOC_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const login = () => {
  const [isLoging, setIsLoging] = useState(false);
  const [status, setStatus] = useState("");
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [identityStatus, setIdentityStatus] = useState(false);

  const zkNewsAddress = contractAddresses.localhost;

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

    const message = await signer.signMessage("Sign this message to join us");

    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();

    let currentIdentityCommitments = [];
    const response = await fetch("http://localhost:3000/api/identity", {
      method: "GET",
    });

    if (response.status === 500) {
      console.log(response);
    } else {
      currentIdentityCommitments = await response.json();
    }

    const isIdentityIncludedBefore = currentIdentityCommitments.includes(
      identityCommitment.toString()
    );

    if (isIdentityIncludedBefore) {
      setIsLoging(false);
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus(
        "This account has already been registered before. Please try it again with another one"
      );
      return;
    } else {
      const zkNewsContract = new ethers.Contract(
        zkNewsAddress,
        abi.abi,
        signer
      );
      const tx = await zkNewsContract.insertIdentityAsClient(
        ethers.BigNumber.from(identityCommitment)
      );
      // await tx.wait(1);
      setIsStatusChanged(true);
      setIdentityStatus(false);
      setStatus("Your account have been registered successfully");
    }

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
