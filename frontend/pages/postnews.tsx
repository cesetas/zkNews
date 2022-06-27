import React, { useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { Strategy, ZkIdentity } from "@zk-kit/identity";
import { ethers, providers, utils } from "ethers";
import { getContract } from "../utils/contract";
import { contractAddresses } from "../constants";
import Link from "next/link";
import {
  Button,
  Box,
  Container,
  TextField,
  createTheme,
  ThemeProvider,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useRouter } from "next/router";
import fetch from "isomorphic-unfetch";
import LoadingButton from "@mui/lab/LoadingButton";
import { poseidon } from "circomlibjs";

const theme = createTheme();

const initialvalues = {
  title: "",
  category: "",
  location: "",
  news: "",
  photoURL: "",
  likes: 0,
  dislikes: 0,
};

function PostNews() {
  const [values, setValues] = useState(initialvalues);
  const [commitment, setCommitment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [identityStatus, setIdentityStatus] = useState(false);

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
    const message = await signer.signMessage(
      "Please sign the message to continue"
    );

    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();

    let currentIdentityCommitments: any = [];

    try {
      const { zkNewsContract, account } = await getContract();

      let options = { from: account, gas: 6721900 };
      const transactionResponse = await zkNewsContract.methods
        .getIdentityCommitments()
        .call(options);

      currentIdentityCommitments = transactionResponse;
    } catch (error: any) {
      console.log(error || "Failed to get");
    }

    const isIdentityIncludedBefore = currentIdentityCommitments.includes(
      identityCommitment.toString()
    );

    if (!isIdentityIncludedBefore) {
      setIsSubmitting(false);
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus("You should complete the registration process before posting.");
      return;
    } else {
      const res = await fetch("http://localhost:3000/api/posts", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      const postId = data.data._id;

      const privateSalt = commitment;

      const hashCommitment = poseidon([privateSalt, identityCommitment]);

      const { zkNewsContract, account } = await getContract();

      let options = { from: account, gas: 6721900 };

      await zkNewsContract.methods
        .postNews(utils.formatBytes32String(postId), hashCommitment)
        .send(options);

      console.log("14");
      setIsStatusChanged(true);
      setIdentityStatus(false);
      setStatus("Your post have been published successfully");
      setIsSubmitting(false);
      setCommitment("");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
                <h1 className="text-6xl text-align-center  tracking-tight mb-4 font-extrabold text-blue-900 sm:text-3xl md:text-5xl">
                  Post your news/articles
                </h1>

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "400",
                    mt: 2,
                  }}
                  noValidate
                  autoComplete="off"
                >
                  <TextField
                    fullWidth
                    required
                    id="title"
                    name="title"
                    label="Title"
                    variant="outlined"
                    sx={{
                      mt: 2,
                    }}
                    value={values.title}
                    onChange={handleChange}
                  />
                  <Select
                    variant="outlined"
                    labelId="category1"
                    name="category"
                    id="category"
                    value={values.category}
                    label="Category"
                    sx={{
                      mt: 2,
                    }}
                    onChange={handleChange}
                  >
                    <MenuItem value={"Politics"}>Politics</MenuItem>
                    <MenuItem value={"Business"}>Business</MenuItem>
                    <MenuItem value={"Sports"}>Sports</MenuItem>
                    <MenuItem value={"Life"}>Life</MenuItem>
                    <MenuItem value={"Culture"}>Culture</MenuItem>
                  </Select>
                  <FormHelperText>*Please select a category</FormHelperText>

                  <Select
                    variant="outlined"
                    labelId="location1"
                    id="location"
                    name="location"
                    value={values.location}
                    label="Location"
                    onChange={handleChange}
                  >
                    <MenuItem value={"Africa"}>Africa</MenuItem>
                    <MenuItem value={"Asia"}>Asia</MenuItem>
                    <MenuItem value={"Australia"}>Australia</MenuItem>
                    <MenuItem value={"Europe"}>Europe</MenuItem>
                    <MenuItem value={"Latin America"}>Latin America</MenuItem>
                    <MenuItem value={"Middle East"}>Middle East</MenuItem>
                    <MenuItem value={"US&Canada"}>US&Canada</MenuItem>
                  </Select>

                  <FormHelperText>*Please select a location</FormHelperText>

                  <TextField
                    fullWidth
                    id="news"
                    name="news"
                    label="News"
                    multiline
                    rows={5}
                    sx={{
                      mt: 2,
                    }}
                    helperText="Share the news"
                    value={values.news}
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    id="photoURL"
                    name="photoURL"
                    label="Photo URL"
                    sx={{
                      mt: 2,
                    }}
                    value={values.photoURL}
                    onChange={handleChange}
                  />
                  <TextField
                    fullWidth
                    required
                    type="password"
                    id="commitment"
                    name="commitment"
                    label="Ownership Commitment"
                    variant="outlined"
                    helperText="Please define your private key"
                    sx={{
                      mt: 2,
                    }}
                    value={commitment}
                    onChange={(e) => {
                      setCommitment(e.target.value);
                    }}
                  />
                  <Button
                    type="submit"
                    color="inherit"
                    fullWidth
                    variant="contained"
                    endIcon={<SendIcon />}
                    sx={{
                      mt: 2,
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
        </Container>
      </ThemeProvider>
    </div>
  );
}

export default PostNews;
