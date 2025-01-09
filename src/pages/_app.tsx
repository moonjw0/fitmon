import '@/styles/globals.css';
import '@/styles/pretendard.css';
import Layout from '../components/layout/Layout';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <aside id="aside-root"></aside>
    </>
  );
}
