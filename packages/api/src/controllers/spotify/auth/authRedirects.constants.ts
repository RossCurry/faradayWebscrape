import dotenv from 'dotenv';
dotenv.config()
const mode = process.env.NODE_ENV || 'development';

export const REDIRECTS = {
  callback: 'http://localhost:3000/callback',
  redirect: mode === 'development' ?  'http://localhost:5173/redirected' : 'https://rosscurry.dev/redirected',
  redirectLocal: 'http://localhost:5173/redirected',
  redirect2:  'http://localhost:3000/api/spotify/redirect'
}