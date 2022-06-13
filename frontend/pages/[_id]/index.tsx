import { useState, useEffect } from "react";
import fetch from "isomorphic-unfetch";
import { useRouter } from "next/router";
import LoadingButton from "@mui/lab/LoadingButton";
import SendIcon from "@mui/icons-material/Send";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

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
    const postId = router.query._id;

    try {
      const liked = await fetch(`http://localhost:3000/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ likes: post.likes++ }),
      });
      setIsLiking(false);
    } catch (error) {
      console.log(error);
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
