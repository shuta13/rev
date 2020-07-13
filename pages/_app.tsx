import { AppProps } from "next/app";
import Head from "next/head";

import "../assets/styles/global.scss";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Re:V</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default App;
