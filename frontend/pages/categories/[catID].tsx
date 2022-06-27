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
import { useRouter } from "next/router";
// import { useRouter } from "../../node_modules/next/router";

export default function news({ posts }) {
  const router = useRouter();
  const { catID } = router.query;
  const filteredPost = posts.filter((post) => {
    return post.location === catID;
  });
  console.log(filteredPost);
  return (
    <>
      <Container fixed>
        <Typography color="blue" variant="h3" component="div">
          {catID.toUpperCase()} NEWS
        </Typography>
        <Grid
          container
          spacing={{ xs: 1, sm: 2, md: 2 }}
          columns={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
        >
          {filteredPost.map((filteredPost) => {
            return (
              <Grid
                item
                xs={1}
                sm={1}
                md={1}
                lg={1}
                xl={1}
                key={filteredPost._id}
              >
                <Link href={`/${filteredPost._id}`}>
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
                      image={filteredPost.location}
                      alt={filteredPost.category}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {filteredPost.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {filteredPost.news}
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
