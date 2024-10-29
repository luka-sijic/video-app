import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token');

type Metadata = {
    id: number;
    title: string;
    thumbnail: string;
    duration: string;
    likes: number;
    views: number;
};

const api = axios.create({
    baseURL: apiUrl,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
});

export const fetchVideoMetaData = async (): Promise<Metadata[]> => {
    try {
        const response = await api.get<Metadata[]>('/home');
        return response.data;
    } catch (error) {
        console.log("Error fetch video meta data", error);
        throw error;
    }
};
