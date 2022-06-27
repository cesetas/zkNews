import { useState } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { Strategy, ZkIdentity } from "@zk-kit/identity";
import { generateMerkleProof, Semaphore } from "@zk-kit/protocols";
import { ethers, providers, utils } from "ethers";
import { getContract } from "../../utils/contract";
import fetch from "isomorphic-unfetch";
import { useRouter } from "next/router";
import LoadingButton from "@mui/lab/LoadingButton";
import SendIcon from "@mui/icons-material/Send";
import {
  Button,
  Box,
  Container,
  TextField,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { poseidon } from "circomlibjs";

export default function Post({ post }) {
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [status, setStatus] = useState("");
  const [isStatusChanged, setIsStatusChanged] = useState(false);
  const [identityStatus, setIdentityStatus] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [salt, setSalt] = useState("");

  const router = useRouter();
  const postId = router.query._id;

  const likePost = async () => {
    setIsLiking(true);

    const provider = (await detectEthereumProvider()) as any;

    if (!provider) {
      alert("MetaMask not found");
      setIsLiking(false);
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

    let identityCommitments: any = [];

    const { zkNewsContract, account } = await getContract();

    let options = { from: account, gas: 6721900 };
    const transactionResponse = await zkNewsContract.methods
      .getIdentityCommitments()
      .call(options);

    identityCommitments = transactionResponse;

    const isIdentityIncludedBefore = identityCommitments.includes(
      identityCommitment.toString()
    );

    if (!isIdentityIncludedBefore) {
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus("Please try to like after registration.");
      setIsLiking(false);
      return;
    } else {
      const identityCommitmentsSemaphore = [
        BigInt(1),
        identityCommitment,
        BigInt(2),
      ];
      const merkleProof = generateMerkleProof(
        20,
        BigInt(0),
        identityCommitmentsSemaphore,
        identityCommitment
      );
      const signal = "newLike";

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
        await zkNewsContract.methods
          .likePost(
            utils.formatBytes32String(postId),
            utils.formatBytes32String(signal),
            merkleProof.root,
            publicSignals.nullifierHash,
            publicSignals.externalNullifier,
            solidityProof
          )
          .send({ from: account, gas: 6721900 });
      } catch (error) {
        setIsStatusChanged(true);
        setIdentityStatus(true);
        setIsLiking(false);
        setStatus("You can not  like/dislike more than one!");
        console.log(error);
        return;
      }

      try {
        const liked = await fetch(`http://localhost:3000/api/posts/${postId}`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ likes: post.likes++ }),
        });
      } catch (error) {
        setIsLiking(false);
        console.log(error);
      }
      setIsStatusChanged(true);
      setIdentityStatus(false);
      setIsLiking(false);
      setStatus("Post have been liked successfully");
      console.log("Your post have been liked successfully");
    }
  };

  const dislikePost = async () => {
    setIsDisliking(true);

    const provider = (await detectEthereumProvider()) as any;

    if (!provider) {
      alert("MetaMask not found");
      setIsDisliking(false);
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

    let identityCommitments: any = [];

    const { zkNewsContract, account } = await getContract();

    let options = { from: account, gas: 6721900 };
    const transactionResponse = await zkNewsContract.methods
      .getIdentityCommitments()
      .call(options);

    identityCommitments = transactionResponse;

    const isIdentityIncludedBefore = identityCommitments.includes(
      identityCommitment.toString()
    );

    if (!isIdentityIncludedBefore) {
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setStatus("Please try to dislike after registration.");
      setIsDisliking(false);
      return;
    } else {
      const identityCommitmentsSemaphore = [
        BigInt(1),
        identityCommitment,
        BigInt(2),
      ];
      const merkleProof = generateMerkleProof(
        20,
        BigInt(0),
        identityCommitmentsSemaphore,
        identityCommitment
      );
      const signal = "newDislike";

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
        await zkNewsContract.methods
          .dislikePost(
            utils.formatBytes32String(postId),
            utils.formatBytes32String(signal),
            merkleProof.root,
            publicSignals.nullifierHash,
            publicSignals.externalNullifier,
            solidityProof
          )
          .send({ from: account, gas: 6721900 });
      } catch (error) {
        setIsStatusChanged(true);
        setIdentityStatus(true);
        setIsDisliking(false);
        setStatus("You can not like/dislike more than one!");
        console.log(error);
        return;
      }

      try {
        const disliked = await fetch(
          `http://localhost:3000/api/posts/${postId}`,
          {
            method: "PUT",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ likes: post.dislikes++ }),
          }
        );
      } catch (error) {
        setIsDisliking(false);
        console.log(error);
      }
      setIsStatusChanged(true);
      setIdentityStatus(false);
      setIsDisliking(false);
      setStatus("Post have been disliked successfully");
      console.log("Your post have been disliked successfully");
    }
  };

  const fundPost = async () => {
    setIsFunding(true);

    const amount = fundAmount;

    const provider = (await detectEthereumProvider()) as any;
    if (!provider) {
      alert("MetaMask not found");
      setIsFunding(false);
      return;
    }

    await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();

    const { zkNewsContract } = await getContract();
    const account = await signer.getAddress();

    await zkNewsContract.methods
      .fundPost(utils.formatBytes32String(postId))
      .send({
        from: account,
        gas: 6721900,
        value: ethers.utils.parseUnits(amount, "ether"),
      });

    setIsStatusChanged(true);
    setIdentityStatus(false);
    setIsFunding(false);
    setStatus("Post have been funded successfully");
    console.log("Your post have been funded successfully");
    setFundAmount("");
  };

  const withdraw = async () => {
    setIsWithdrawing(true);

    alert(
      "Only post owners are allowed to withdraw funds. If you are the owner of this post please keep going"
    );

    const amount = utils.parseEther(withdrawAmount);

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

    const privateSalt = salt;

    const hashCommitment = poseidon([privateSalt, identityCommitment]);
    console.log("hash commitment :" + hashCommitment);

    const { zkNewsContract, account } = await getContract();

    try {
      await zkNewsContract.methods
        .withdrawFunds(
          utils.formatBytes32String(postId),
          amount,
          hashCommitment
        )
        .send({ from: account, gas: 6721900 });
    } catch (error) {
      setIsStatusChanged(true);
      setIdentityStatus(true);
      setIsWithdrawing(false);
      setStatus("You can not withdraw!");
      setWithdrawAmount("");
      setSalt("");
      console.log(error);
      return;
    }

    setIsStatusChanged(true);
    setIdentityStatus(false);
    setStatus(`${withdrawAmount} ETH has been withdrawn succesfully`);
    setIsWithdrawing(false);
    setWithdrawAmount("");
    setSalt("");
    console.log("Withdraw successfully");
  };

  //This function is just for development. After deploymnet to mainnet it will be deleted
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

  const handleLike = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLiking(true);
    likePost();
  };

  const handleDislike = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsDisliking(true);
    dislikePost();
    // close();
  };

  const handleFund = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsFunding(true);
    fundPost();
    // close();
  };

  const handleWithdraw = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsWithdrawing(true);
    withdraw();
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
                width: 700,
                height: "auto",
                backgroundColor: "light.gray",
              }}
            >
              <h1 className="text-8xl tracking-tight mb-4 font-extrabold text-gray-900 sm:text-3xl md:text-6xl">
                {post.title}
              </h1>
              <img src={post.photoURL} alt={post.location} />
              <h2 className="mt-3 text-base 	text-align: justify; text-gray-500 sm:mt-5 sm:text-lg sm:max-w-3xl sm:mx-auto md:mt-5 md:text-3xl lg:mx-0">
                {post.news}
              </h2>

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

              <Button onClick={handleDelete} size="small">
                delete
              </Button>
            </Box>
            {!isStatusChanged ? (
              <></>
            ) : (
              <>
                <Alert severity={identityStatus ? "error" : "success"}>
                  {status}
                </Alert>
              </>
            )}

            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box
                    component="form"
                    onSubmit={handleFund}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "200",
                      mt: 2,
                    }}
                    noValidate
                    autoComplete="off"
                  >
                    <TextField
                      fullWidth
                      id="fund"
                      label="Fund Amount (ETH)"
                      helperText="Specify the amount as ether"
                      value={fundAmount}
                      onChange={(e) => {
                        setFundAmount(e.target.value);
                      }}
                    />
                    {isFunding ? (
                      <CircularProgress />
                    ) : (
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
                    )}
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    component="form"
                    onSubmit={handleWithdraw}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: "200",
                      mt: 2,
                    }}
                    noValidate
                    autoComplete="off"
                  >
                    <TextField
                      fullWidth
                      id="withdraw"
                      label="Withdraw Amount (ETH)"
                      value={withdrawAmount}
                      onChange={(e) => {
                        setWithdrawAmount(e.target.value);
                      }}
                    />
                    <TextField
                      fullWidth
                      type="password"
                      id="salt"
                      label="Your Password"
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      helperText="Specify the password to withdraw"
                      sx={{
                        mt: 3,
                        color: "blue",
                      }}
                      value={salt}
                      onChange={(e) => {
                        setSalt(e.target.value);
                      }}
                    />
                    {isWithdrawing ? (
                      <CircularProgress />
                    ) : (
                      <Button
                        type="submit"
                        color="inherit"
                        fullWidth
                        variant="contained"
                        endIcon={<SendIcon />}
                        sx={{
                          mt: 3,
                          mb: 3,
                          color: "red",
                          backgroundColor: "yellow",
                        }}
                      >
                        Withdraw Funds
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
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
