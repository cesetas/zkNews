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
import { contractAddresses } from "../constants";
import abi from "../../contracts/artifacts/contracts/zkNews.sol/zkNews.json";
import { getContract } from "../utils/contract";

const login = () => {
  const [isLoging, setIsLoging] = useState(false);
  const [status, setStatus] = useState("");
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [identityStatus, setIdentityStatus] = useState(false);

  const zkNewsAddress = contractAddresses.localhost;

  const handleLogin = async () => {
    setIsLoging(true);
    if (!window.ethereum) {
      alert("Install metamask");
      setIsLoging(false);
      return;
    }

    // const provider = (await detectEthereumProvider()) as any;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    // await provider.request({ method: "eth_requestAccounts" });
    // const ethersProvider = new providers.Web3Provider(provider);
    // const signer = ethersProvider.getSigner();
    const signer = provider.getSigner();

    const message = await signer.signMessage("Sign this message to join us");

    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();

    let identityCommitments: any = [];

    const zkNewsContract = await new ethers.Contract(
      zkNewsAddress,
      abi.abi,
      signer
    );
    // const { contract, account } = await getContract();
    // const account = contract.address;

    // let options = { from: account, gas: 6721900 };
    const tx = await zkNewsContract.getIdentityCommitments();

    for (var i = 0; i < tx.length; i++) {
      identityCommitments.push(tx[i].toString());
    }

    console.log("IdentityCommitments  : " + identityCommitments);

    const isIdentityIncludedBefore = identityCommitments.includes(
      identityCommitment.toString()
    );

    console.log("isIdentityIncludedBefore  : " + isIdentityIncludedBefore);

    if (isIdentityIncludedBefore) {
      setIsLoging(false);
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus(
        "This account has already been registered before. Please try it again with another one"
      );
      return;
    } else {
      const tx = await zkNewsContract.insertIdentityAsClient(
        ethers.BigNumber.from(identityCommitment)
      );

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
