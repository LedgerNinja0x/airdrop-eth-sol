import "@/styles/globals.css";
import axios from "axios";

axios.defaults.baseURL = process.env.NEXTAUTH_URL

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
