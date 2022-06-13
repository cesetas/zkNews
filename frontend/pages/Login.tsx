import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Strategy, ZkIdentity } from "@zk-kit/identity";
import { ethers } from "ethers";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

const Login = () => {
  const [identityCommitment, setIdentityCommitment] = useState(null);
  const [connectWallet, setConnectWallet] = useState("");
  const [isLoging, setIsLoging] = useState(false);
  const [pending, setPending] = useState(false);

  const handleLogin = async () => {
    setIsLoging(true);

    const { ethereum } = window;
    if (!ethereum) {
      alert("Install metamask");
      return;
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length == 0) {
      setConnectWallet("You need to connect wallet");
    }

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const message = await signer.signMessage(
      "Sign this message to create your identity!"
    );

    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();

    console.log("Commitment: ", identityCommitment);

    try {
      setPending(true);
      const tx = await zkNews.insertIdentityAsClient(
        ethers.BigNumber.from(identityCommitment)
      );
      const receipt = await tx.wait();

      console.log(receipt);

      if (receipt.status === 1) {
        console.log("Registration done");
      }
    } catch (e) {
      setPending(false);
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
        <Typography gutterBottom variant="h5" component="div">
          zKNews Registration
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Become our journalist/subscriber
        </Typography>

        {isLoging ? (
          <CircularProgress />
        ) : (
          <Button onClick={handleLogin} size="small">
            Login
          </Button>
        )}
        <h2 style={{ color: "red", marginTop: "1em" }}>{connectWallet}</h2>
      </Box>
    </Container>
  );
};

export default Login;
