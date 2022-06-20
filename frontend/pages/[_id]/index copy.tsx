import { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { Strategy, ZkIdentity } from "@zk-kit/identity";
import { generateMerkleProof, Semaphore } from "@zk-kit/protocols";
import { ethers, providers } from "ethers";
import { getContract } from "../../utils/contract";
import fetch from "isomorphic-unfetch";
import { useRouter } from "next/router";
import LoadingButton from "@mui/lab/LoadingButton";
import SendIcon from "@mui/icons-material/Send";
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
import Link from "next/link";
import { contractAddresses, abi } from "../../constants";

export default function Post({ post }) {
  const [confirm, setConfirm] = useState(false);
  const [values, setValues] = useState({
    title: post.title,
    news: post.news,
    category: post.category,
    location: post.location,
    likes: post.likes,
    dislikes: post.dislikes,
  });
  // const [likes, setLikes] = useState(0);
  // const [dislikes, setDislikes] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [identityStatus, setIdentityStatus] = useState(false);
  const [fundAmount, setFundAmount] = useState(0);

  const zkNewsAddress = contractAddresses.localhost;
  const router = useRouter();

  useEffect(() => {
    if (isDeleting) {
      deletePost();
    }
  }, [isDeleting]);

  // useEffect(() => {
  //   setValues();
  // }, [values]);

  // const open = () => setConfirm(true);

  // const close = () => setConfirm(false);

  // { ...values, likes: values.likes }
  // setValues({ ...values, likes: parseInt(post.likes) + 1 });

  const likePost = async () => {
    setIsSubmitting(true);

    const postId = router.query._id;
    console.log(typeof postId);

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

    console.log(identityCommitment);
    let currentIdentityCommitments = [];
    const res = await fetch("http://localhost:3000/api/identity", {
      method: "GET",
    });

    if (res.status === 500) {
      console.log(res);
    } else {
      currentIdentityCommitments = await res.json();
    }

    const isIdentityIncludedBefore = currentIdentityCommitments.includes(
      identityCommitment.toString()
    );
    // const identityCommitments = [BigInt(1), identityCommitment, BigInt(2)];
    console.log(currentIdentityCommitments);
    console.log(identityCommitment);

    console.log(isIdentityIncludedBefore);

    if (!isIdentityIncludedBefore) {
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus("Please try to like after registration.");
      console.log("Please try to like after registration.");
      setIsSubmitting(false);
      return;
    } else {
      const merkleProof = generateMerkleProof(
        20,
        BigInt(0),
        currentIdentityCommitments,
        identityCommitment
      );
      console.log(merkleProof);
      console.log("Creating your Semaphore proof...");
      console.log("9");
      const signal = "newLike";

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

      const solidityProof = Semaphore.packToSolidityProof(proof);
      console.log("11");
      console.log(solidityProof);
      const response = await fetch("http://localhost:3000/api/likes", {
        method: "POST",
        body: JSON.stringify({
          postId,
          nullifierHash: publicSignals.nullifierHash,
          solidityProof: solidityProof,
          root: merkleProof.root.toString(),
          externalNullifier: publicSignals.externalNullifier,
        }),
      });
      console.log("12");
      console.log(response);
      if (response.status === 500) {
        const errorMessage = await response.text();
        console.log(errorMessage);
      } else {
        try {
          const liked = await fetch(
            `http://localhost:3000/api/posts/${postId}`,
            {
              method: "PUT",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ likes: post.likes++ }),
            }
          );
          setIsLiking(false);
          router.push("/news");
        } catch (error) {
          console.log(error);
        }
        console.log("14");
        setIsStatusChanged(true);
        setIdentityStatus(false);
        setStatus("Your post have been liked successfully");
        console.log("Your post have been liked successfully");
      }
      // const zkNewsContract = new ethers.Contract(zkNewsAddress, abi, signer);
      // const tx = await zkNewsContract.insertIdentityAsClient(
      //   ethers.BigNumber.from(identityCommitment)
      // );
      // await tx.wait(1);

      // }
    }
  };

  const dislikePost = async () => {
    const postId = router.query._id;
    try {
      const liked = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dislikes: post.dislikes++ }),
      });
      setIsDisliking(false);
    } catch (error) {
      console.log(error);
    }
  };

  const deletePost = async () => {
    const postId = router.query._id;
    try {
      const deleted = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: "Delete",
      });

      router.push("/news");
    } catch (error) {
      console.log(error);
    }
  };

  const handleLike = async () => {
    setIsLiking(true);
    likePost();
    // close();
  };

  const handleDislike = async () => {
    setIsDisliking(true);
    dislikePost();
    // close();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    deletePost();
    // close();
  };

  const [loading, setLoading] = useState(true);
  function handleClick() {
    setLoading(true);
  }

  return (
    <div>
      {isDeleting ? (
        <LoadingButton
          onClick={handleClick}
          endIcon={<SendIcon />}
          loading={loading}
          loadingPosition="end"
          variant="contained"
        >
          Deleting
        </LoadingButton>
      ) : (
        <>
          <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
            <Box
              sx={{
                width: 600,
                height: "auto",
                backgroundColor: "light.gray",
              }}
            >
              <Typography gutterBottom variant="h5" component="div">
                {post.title}
              </Typography>
              <img src={post.location} alt={post.category} />
              <Typography variant="body2" color="text.secondary">
                {post.news}
              </Typography>

              <Button onClick={handleLike} size="small">
                {isLiking ? (
                  <CircularProgress />
                ) : (
                  <span>Like {post.likes}</span>
                )}
              </Button>
              <Button onClick={handleDislike} size="small" color="warning">
                {isDisliking ? (
                  <CircularProgress />
                ) : (
                  <span>Dislike {post.dislikes}</span>
                )}
              </Button>
              <Button size="small">Fund</Button>
              <Button onClick={handleDelete} size="small">
                delete
              </Button>
            </Box>
            <FormControl
              sx={{ m: 1, position: "inline-block", width: 600 }}
              variant="outlined"
            >
              <span>
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
                  Fund
                </Button>
              </span>
              <span>
                <TextField
                  fullWidth
                  id="fund"
                  label="Fund Amount"
                  helperText="Specify the amount to be funded"
                  value={fundAmount}
                  onChange={(e) => {
                    setFundAmount(e.target.value);
                  }}
                />
              </span>
            </FormControl>
          </Container>
        </>
      )}
      {/* <Confirm
                open={confirm}
                onCancel={close}
                onConfirm={handleDelete}
            /> */}
    </div>
  );
}

Post.getInitialProps = async ({ query: { _id } }) => {
  const res = await fetch(`http://localhost:3000/api/posts/${_id}`);
  const { data } = await res.json();

  return { post: data };
};
