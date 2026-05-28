import { AuthProvider } from '../lib/auth';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '10px',
            fontFamily: 'inherit',
            fontSize: '14px',
          },
        }}
      />
    </AuthProvider>
  );
}

export default MyApp;
