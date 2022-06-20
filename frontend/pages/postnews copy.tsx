import React, { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { Strategy, ZkIdentity } from "@zk-kit/identity";
import { generateMerkleProof, Semaphore } from "@zk-kit/protocols";
import { ethers, providers } from "ethers";
import { getContract } from "../utils/contract";
import { contractAddresses, abi } from "../constants";
import Link from "next/link";
import {
  Button,
  Box,
  Typography,
  Container,
  TextField,
  FormControl,
  createTheme,
  ThemeProvider,
  Grid,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
// import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
// import Container from "@mui/material/Container";
// import TextField from "@mui/material/TextField";
// import FormControl from "@mui/material/FormControl";
import SendIcon from "@mui/icons-material/Send";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useRouter } from "next/router";
import fetch from "isomorphic-unfetch";
import LoadingButton from "@mui/lab/LoadingButton";

const theme = createTheme();

const initialvalues = {
  title: "",
  category: "",
  location: "",
  news: "",
  likes: 0,
  dislikes: 0,
};

function PostNews() {
  const [values, setValues] = useState(initialvalues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [errors, setErrors] = useState({});
  // const [isLoging, setIsLoging] = useState(false);
  // const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [identityStatus, setIdentityStatus] = useState(false);

  const router = useRouter();

  const zkNewsAddress = contractAddresses.localhost;

  // useEffect(() => {
  //   if (isSubmitting) {
  //     if (Object.keys(errors).length === 0) {
  //       // createPost();
  //     } else {
  //       setIsSubmitting(false);
  //     }
  //   }
  // }, [errors]);

  const createPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const provider = (await detectEthereumProvider()) as any;
    console.log("1");
    if (!provider) {
      alert("MetaMask not found");
      return;
    }
    console.log("2");
    await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const message = await signer.signMessage("Sign this message to join us");
    console.log("3");
    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();
    console.log("4");
    console.log(identityCommitment);
    let currentIdentityCommitments = [];
    const response = await fetch("http://localhost:3000/api/identity", {
      method: "GET",
    });

    console.log("5");

    if (response.status === 500) {
      console.log(response);
    } else {
      currentIdentityCommitments = await response.json();
    }
    console.log("6");
    console.log(currentIdentityCommitments);
    const isIdentityIncludedBefore = currentIdentityCommitments.includes(
      identityCommitment.toString()
    );
    console.log("7");
    console.log(isIdentityIncludedBefore);

    // const identityCommitments = [BigInt(1), identityCommitment, BigInt(2)];

    if (!isIdentityIncludedBefore) {
      setIsSubmitting(false);
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus(
        "You should complete the registration process. Please try to post after registration."
      );
      return;
    } else {
      // const merkleProof = generateMerkleProof(
      //   20,
      //   BigInt(0),
      //   currentIdentityCommitments,
      //   identityCommitment
      // );
      // console.log(merkleProof);
      // console.log("Creating your Semaphore proof...");
      // console.log("9");
      // const signal = "newsPost";

      // const witness = Semaphore.genWitness(
      //   identity.getTrapdoor(),
      //   identity.getNullifier(),
      //   merkleProof,
      //   merkleProof.root,
      //   signal
      // );
      // console.log("10");

      // const { proof, publicSignals } = await Semaphore.genProof(
      //   witness,
      //   "./semaphore.wasm",
      //   "./semaphore_final.zkey"
      // );
      // console.log(proof);
      // console.log(publicSignals);
      // const solidityProof = Semaphore.packToSolidityProof(proof);
      // console.log("11");
      // console.log(solidityProof);
      // const response = await fetch("/api/nullifier", {
      //   method: "POST",
      //   body: JSON.stringify({
      //     signal,
      //     nullifierHash: publicSignals.nullifierHash,
      //     solidityProof: solidityProof,
      //   }),
      // });
      // console.log("12");
      // if (response.status === 500) {
      //   const errorMessage = await response.text();
      //   console.log(errorMessage);
      // } else {
      try {
        const res = await fetch("http://localhost:3000/api/posts", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        router.push("/news");
      } catch (error) {
        console.log(error);
      }
    }
    // const zkNewsContract = new ethers.Contract(zkNewsAddress, abi, signer);
    // const tx = await zkNewsContract.insertIdentityAsClient(
    //   ethers.BigNumber.from(identityCommitment)
    // );
    // await tx.wait(1);
    console.log("14");
    setIsStatusChanged(true);
    setIdentityStatus(false);
    setStatus("Your post have been published successfully");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.id]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // let errs = validate();
    // setErrors(errs);
    setIsSubmitting(true);
    createPost(event);
    setValues(initialvalues);
  };

  // const validate = () => {
  //   let err = {};

  //   if (!values.title) {
  //     err.title = "Title is required";
  //   }
  //   if (!values.news) {
  //     err.description = "News is required";
  //   }

  //   return err;
  // };

  const [loading, setLoading] = useState(true);
  function handleClick() {
    setLoading(true);
  }

  return (
    <div>
      <ThemeProvider theme={theme}>
        <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
          <FormControl sx={{ m: 1, width: "100ch" }} variant="outlined">
            <div>
              {" "}
              {isSubmitting ? (
                <LoadingButton
                  onClick={handleClick}
                  endIcon={<SendIcon />}
                  loading={loading}
                  loadingPosition="end"
                  variant="contained"
                >
                  Publishing
                </LoadingButton>
              ) : (
                <>
                  <Typography
                    color="blue"
                    variant="h4"
                    component="h1"
                    gutterBottom
                  >
                    Post your news/articles
                  </Typography>
                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      color: "blue",
                      width: 500,
                      height: 900,
                      "& .MuiTextField-root": { m: 1 },
                    }}
                    noValidate
                    autoComplete="off"
                  >
                    <TextField
                      fullWidth
                      required
                      id="title"
                      label="Title"
                      variant="outlined"
                      helperText="sedat"
                      value={values.title}
                      onChange={handleChange}
                    />
                    <TextField
                      fullWidth
                      id="category"
                      label="Category"
                      variant="outlined"
                      color="info"
                      value={values.category}
                      onChange={handleChange}
                    />
                    <TextField
                      fullWidth
                      id="location"
                      label="Location"
                      variant="outlined"
                      value={values.location}
                      onChange={handleChange}
                    />
                    <TextField
                      fullWidth
                      id="news"
                      label="News"
                      multiline
                      rows={5}
                      helperText="Share the news"
                      value={values.news}
                      onChange={handleChange}
                    />
                    <Button
                      type="submit"
                      color="inherit"
                      fullWidth
                      variant="contained"
                      endIcon={<SendIcon />}
                      sx={{
                        mt: 3,
                        mb: 3,
                        color: "blue",
                        backgroundColor: "yellow",
                      }}
                    >
                      Publish
                    </Button>
                    <Link href="/">
                      <Button color="inherit" variant="contained">
                        Back to homepage
                      </Button>
                    </Link>
                  </Box>
                </>
              )}
            </div>
          </FormControl>
        </Container>
      </ThemeProvider>
    </div>
  );
}

export default PostNews;
