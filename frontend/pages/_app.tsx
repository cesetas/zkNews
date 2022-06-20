import "../styles/globals.css";
import Layout from "../components/Layout";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit";

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider initializeOnMount={false}>
      <NotificationProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </NotificationProvider>
    </MoralisProvider>
  );
}

export default MyApp;
