import axios from 'axios';

const rawBase = import.meta.env.VITE_URL_GERAL || '';
const baseURL = rawBase ? (rawBase.endsWith('/') ? rawBase : `${rawBase}/`) : '';

const rawBase2 = import.meta.env.VITE_URL_GERAL2 || '';
const baseURL2 = rawBase2 ? (rawBase2.endsWith('/') ? rawBase2 : `${rawBase2}/`) : '';

export const api = axios.create({
  baseURL,
  timeout: 15000,
});

export const apiOda = axios.create({
  baseURL: baseURL2,
  timeout: 15000,
});

export const hasOdaBase = () => Boolean(baseURL2);
