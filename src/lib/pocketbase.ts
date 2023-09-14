import PocketBase from 'pocketbase';
const pb = new PocketBase(import.meta.env.VITE_APP_POCKETBASE_URL);

export default pb;