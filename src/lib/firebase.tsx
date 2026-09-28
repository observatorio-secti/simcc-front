// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY || 'demo-key',
  authDomain: import.meta.env.VITE_AUTHDOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_PROJECTID || 'demo-project',
  storageBucket: import.meta.env.VITE_STORAGEBUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID || '1234567890',
  appId: import.meta.env.VITE_APPID || '1:1234567890:web:demo',
  measurementId: import.meta.env.VITE_MEASUREMENTID || '',
};

// Initialize Firebase safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let analytics: any = null;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn('Firebase analytics initialization skipped:', e);
      }
    }
  }).catch(() => {});
}

export { analytics };
export const auth = getAuth(app);
export const storage = getStorage(app);

