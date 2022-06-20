import React, { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { Strategy, ZkIdentity } from "@zk-kit/identity";
import { ethers, providers } from "ethers";
import { getContract } from "../utils/contract";
import { contractAddresses } from "../constants";
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
import SendIcon from "@mui/icons-material/Send";
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
  const [status, setStatus] = useState("");
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [identityStatus, setIdentityStatus] = useState(false);

  const router = useRouter();

  const zkNewsAddress = contractAddresses.localhost;

  const createPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const provider = (await detectEthereumProvider()) as any;

    if (!provider) {
      alert("MetaMask not found");
      return;
    }

    await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const message = await signer.signMessage("Sign this message to join us");

    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();

    let currentIdentityCommitments = [];

    try {
      const { contract, account } = await getContract();

      let options = { from: account, gas: 6721900 };
      const tx = await contract.methods.getIdentityCommitments().call(options);

      currentIdentityCommitments = tx;
    } catch (error: any) {
      console.log(error || "Failed to get");
    }

    console.log(currentIdentityCommitments);
    const isIdentityIncludedBefore = currentIdentityCommitments.includes(
      identityCommitment.toString()
    );
    console.log("7");
    console.log(isIdentityIncludedBefore);

    if (!isIdentityIncludedBefore) {
      setIsSubmitting(false);
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus(
        "You should complete the registration process. Please try to post after registration."
      );
      return;
    } else {
      try {
        const res = await fetch("http://localhost:3000/api/posts", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        // router.push("/news");
      } catch (error) {
        console.log(error);
      }
    }

    console.log("14");
    setIsStatusChanged(true);
    setIdentityStatus(false);
    setStatus("Your post have been published successfully");
    setIsSubmitting(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.id]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    createPost(event);
    setValues(initialvalues);
  };

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
              {!isStatusChanged ? (
                <></>
              ) : (
                <>
                  <Alert severity={identityStatus ? "error" : "success"}>
                    {status}
                  </Alert>
                </>
              )}{" "}
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
                    {isStatusChanged ? (
                      <>
                        <Link href="/news">
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              mt: 3,
                              mb: 3,
                              color: "blue",
                              backgroundColor: "yellow",
                            }}
                          >
                            Explore the news
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <></>
                    )}
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
