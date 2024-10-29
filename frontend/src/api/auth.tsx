import axios from 'axios';
const apiUrl = import.meta.env.VITE_AUTH_URL;

const api = axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
});

export const registerUser = async (username: string, password: string) => {
    try {
    	const response = await api.post('/register', {
        	username,
        	password,
      	});
      	return response;
    } catch (error) {
      	console.error('Error registering user:', error);
      	throw error; 
    }
};

export const loginUser = async (username: string, password: string) => {
    try {
    	const response = await api.post('/login', {
        	username,
        	password,
      	});
      	return response;
    } catch (error) {
      	console.error('Error logging in user:', error);
      	throw error;
    }
};	