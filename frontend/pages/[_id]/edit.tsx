import { useState, useEffect } from "react";
import fetch from "isomorphic-unfetch";
import { useRouter } from "next/router";
import LoadingButton from "@mui/lab/LoadingButton";
import Link from "next/link";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import SendIcon from "@mui/icons-material/Send";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const EditPost = ({ post }) => {
  const [values, setValues] = useState({
    title: post.title,
    category: post.category,
    location: post.location,
    news: post.news,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (isSubmitting) {
      if (Object.keys(errors).length === 0) {
        updatePost();
      } else {
        setIsSubmitting(false);
      }
    }
  }, [errors]);

  const updatePost = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/posts/${router.query._id}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let errs = validate();
    setErrors(errs);
    setIsSubmitting(true);
  };

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    let err = {};

    if (!values.title) {
      err.title = "Title is required";
    }
    if (!values.news) {
      err.news = "news is required";
    }

    return err;
  };

  return (
    <div className="form-container">
      <h1>Update post</h1>
      <div>
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
            <Typography color="blue" variant="h4" component="h1" gutterBottom>
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
    </div>
  );
};

EditPost.getInitialProps = async ({ query: { _id } }) => {
  const res = await fetch(`http://localhost:3000/api/posts/${_id}`);
  const { data } = await res.json();

  return { post: data };
};

export default EditPost;
