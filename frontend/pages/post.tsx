import React, { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { Strategy, ZkIdentity } from "@zk-kit/identity";
import { generateMerkleProof, Semaphore } from "@zk-kit/protocols";
import { providers } from "ethers";
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

function post() {
  const [values, setValues] = useState(initialvalues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState("");
  const [errors, setErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (isSubmitting) {
      if (Object.keys(errors).length === 0) {
        // createPost();
      } else {
        setIsSubmitting(false);
      }
    }
  }, [errors]);

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
      "Sign this message to create your identity!"
    );

    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();

    try {
      const { contract, account } = await getContract();

      let options = { from: account, gas: 6721900 };
      let identityCommitments: any = [];
      const identityCommitmentsBN = await contract.methods
        .getIdentityCommitments(sessionId)
        .call(options);

      for (var i = 0; i < identityCommitmentsBN.length; i++) {
        identityCommitments.push(identityCommitmentsBN[i].toString());
      }
      res.status(200).send(identityCommitments);
    } catch (error: any) {
      res.status(500).send(error.reason || "Failed to join session");
    }

    const identityCommitments = await zkNews.getIdentityCommitments();
    console.log("Identity commitments: ", identityCommitments);

    const signal = "newsPost";

    try {
      merkleProof = generateMerkleProof(
        20,
        BigInt(0),
        identityCommitments,
        identityCommitment
      );
    } catch (error) {
      alert(error);
      isSubmitting(false);
      return;
    }

    setLogs("Creating your Semaphore proof...");

    const witness = Semaphore.genWitness(
      identity.getTrapdoor(),
      identity.getNullifier(),
      merkleProof,
      merkleProof.root,
      signal
    );

    const { proof, publicSignals } = await Semaphore.genProof(
      witness,
      "./semaphore.wasm",
      "./semaphore_final.zkey"
    );
    const solidityProof = Semaphore.packToSolidityProof(proof);

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

    if (response.status === 500) {
      const errorMessage = await response.text();

      setLogs(errorMessage);
    } else {
      setLogs("Your post is published");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [event.target.id]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let errs = validate();
    setErrors(errs);
    setIsSubmitting(true);
    createPost();
    setValues(initialvalues);
  };

  const validate = () => {
    let err = {};

    if (!values.title) {
      err.title = "Title is required";
    }
    if (!values.news) {
      err.description = "News is required";
    }

    return err;
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
                      helperText={
                        errors.title
                          ? {
                              content: "Please enter a title",
                              pointing: "below",
                            }
                          : null
                      }
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
                      fullWidth
                      variant="contained"
                      endIcon={<SendIcon />}
                      sx={{ mt: 3, mb: 3 }}
                    >
                      Publish
                    </Button>
                  </Box>
                </>
              )}
            </div>

            <Link href="/">
              <Button variant="contained">Back to homepage</Button>
            </Link>
          </FormControl>
        </Container>
      </ThemeProvider>
    </div>
  );
}

export default post;
