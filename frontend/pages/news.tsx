import * as React from "react";
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

export default function news({ posts }) {
  return (
    <>
      <Container fixed>
        <Typography color="blue" variant="h3" component="div">
          NEWS & ARTICLES
        </Typography>
        <Grid
          container
          spacing={{ xs: 1, sm: 2, md: 2 }}
          columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
        >
          {posts.map((post, _id) => {
            return (
              <Grid item xs={1} sm={1} md={1} lg={1} xl={1} key={_id}>
                <Link href={`/${post._id}`}>
                  <Card
                    sx={{
                      minWidth: 200,
                      maxWidth: 300,
                      minHeight: 300,
                      maxHeight: 300,
                    }}
                  >
                    <CardMedia
                      component="img"
                      max-height="10px"
                      image={post.location}
                      alt={post.category}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {post.news}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">Like</Button>
                      <Button size="small">Dislike</Button>
                      <Button size="small">Fund</Button>
                    </CardActions>
                  </Card>
                </Link>
              </Grid>
            );
          })}
        </Grid>
        <br />

        <Link href="/">
          <Button fullWidth variant="contained">
            Back to Home
          </Button>
        </Link>
      </Container>
    </>
  );
}

news.getInitialProps = async () => {
  const res = await fetch("http://localhost:3000/api/posts");
  const { data } = await res.json();

  return { posts: data };
};
