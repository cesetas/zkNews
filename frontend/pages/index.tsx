import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import Navbar from "../components/Navbar";
import MainBody from "../components/MainBody";
import Footer from "../components/Footer";
import Link from "next/link";

export default function Home({ posts }) {
  return (
    <div>
      <MainBody />
    </div>
  );
}

Home.getInitialProps = async () => {
  const res = await fetch("http://localhost:3000/api/posts");
  const { data } = await res.json();

  return { posts: data };
};
