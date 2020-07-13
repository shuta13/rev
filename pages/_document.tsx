import Document, {
  Html,
  Head,
  Main,
  NextScript,
  // DocumentContext
} from "next/document";

class MyDocument extends Document {
  // static async getInitialProps(ctx: DocumentContext) {
  //   const initialProps = await Document.getInitialProps(ctx);
  //   return { ...initialProps };
  // }
  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="" />

          <meta name="description" content="Reactive Visual Jockey App." />
          <meta property="og:site_name" content="Re:V" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="" />
          <meta property="og:title" content="Re:V" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            property="og:description"
            content="Reactive Visual Jockey App."
          />
          <meta property="og:image" content="" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
