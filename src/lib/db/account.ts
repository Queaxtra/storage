import { Client, Account } from 'appwrite';

export const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APP_PROJECT_ID);

export const accountDB = new Account(client);
export { ID } from 'appwrite';