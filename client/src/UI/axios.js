import axios from 'axios';

export let BASE_ENDPOINT = '';
//BASE_ENDPOINT = 'https://api.dev.somethingserver.xyz';
// when developing locally, change this value to local
export const APP_ENVIRONMENT = 'local';

if (APP_ENVIRONMENT === 'local') {
    BASE_ENDPOINT = 'http://localhost:8000';
} 

const BASE_URL = `${BASE_ENDPOINT}/api/v1`;
//console.log(BASE_ENDPOINT)

export default axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json', 
        'Accept': 'application/json, text/plain, */*',

    },
    withCredentials: true
});
