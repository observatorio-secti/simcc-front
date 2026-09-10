import axios from 'axios';

const rawBase = import.meta.env.VITE_URL_GERAL || '';
const baseURL = rawBase ? (rawBase.endsWith('/') ? rawBase : `${rawBase}/`) : '';

export const api = axios.create({
  baseURL,
});
