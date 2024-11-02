import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
import { jwtDecode } from "jwt-decode";
const token = localStorage.getItem('token');

type Metadata = {
    id: number;
    title: string;
    thumbnail: string;
    duration: string;
    likes: number;
    views: number;
};

interface DecodedToken {
	username: string;
}

const api = axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
});

export const fetchVideoMetaData = async (): Promise<Metadata[]> => {
    try {
        if (token) {
            const decodedToken = jwtDecode<DecodedToken>(token);
            const response = await api.get<Metadata[]>('/home/' + decodedToken.username);
            return response.data;
        }
    } catch (error) {
        console.log("Error fetch video meta data", error);
        throw error;
    }
    return [];
};
