'use client'

import { useState, useEffect } from 'react';
import { MapPin, Calendar, File, HardDrive } from "lucide-react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { Play, Heart, MessageSquare } from 'lucide-react';
const apiUrl = import.meta.env.VITE_API_URL;
const authUrl = import.meta.env.VITE_AUTH_URL;

type UserType = {
    id: number;
    username: string;
    password: string;
    credits: number;
    role: number;
    status: string;
    country: string;
    rating: number;
    avatar: string;
    creationdate: string;
};

type StorageData = {
  amt: number;
  total: number;
};

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

export default function Profile({ userID }: { userID: string }) {
    const [user, setUser] = useState<UserType | null>(null);
    const [storage, setStorage] = useState<StorageData | null>(null);
    const [remaining, setRemaining] = useState<number | null>(null);
	  const [metadata, setMetadata] = useState<Metadata[]>([]);
    const [username, setUsername] = useState<string | null>(null);
    const baseAvatarURL = import.meta.env.VITE_STATIC_URL + "/avatars/";
    const baseIconURL = import.meta.env.VITE_STATIC_URL + "/icons/";
    const token = localStorage.getItem('token');

	  const thumbnailBaseURL = import.meta.env.VITE_STATIC_URL + "/thumbnails/";
	  const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            const decodedToken = jwtDecode<DecodedToken>(token);
            setUsername(decodedToken.username);
        } else {
            console.log("No token found, redirecting to login...");
            navigate('/login');
        }
    }, [token, navigate]);

    // Fetch user data once username is available
    useEffect(() => {
      const fetchData = async () => {
          try {
              if (!username) return;
  
              const [userRes, storageRes, videoRes] = await Promise.all([
                  axios.get(authUrl + `/users/${userID}`, { headers: { Authorization: `Bearer ${token}` } }),
                  axios.get(apiUrl + `/storage/${userID}`, { headers: { Authorization: `Bearer ${token}` } }),
                  axios.get(apiUrl + `/home/${userID}`, { headers: { Authorization: `Bearer ${token}` } })
              ]);
  
              setUser(userRes.data);
              const storageData = storageRes.data as StorageData;
              setStorage(storageData);
              setRemaining(10 - storageData.total);
              setMetadata(videoRes.data);
          } catch (error) {
              console.log("Error fetching data:", error);
          }
      };
  
      fetchData();
  }, [username, token, userID]);

    // Fetch storage and activity data once username is available
    useEffect(() => {
        const getInfo = async () => {
            if (!username) return; 
            try {
                console.log("Fetching data for username: " + userID);

                const response3 = await axios.get(apiUrl + `/storage/${userID}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setStorage(response3.data);
                const res = response3.data as StorageData;
                setRemaining(10 - res.total);

            } catch (error) {
                console.log("Error fetching storage or activity data");
            }
        };
        getInfo();
    }, [username, token, userID]);

    // Fetch video metadata
    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const r1 = await axios.get<Metadata[]>(
                  apiUrl + `/home/${userID}`, 
                  {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                  }
                );
                setMetadata(r1.data);
            } catch (error) {
              if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
              } else {
                console.error('Error fetching videos:', error);
              }
            }
        };
        fetchVideo();
    }, [userID]);


    return (
    	<div className="min-h-screen bg-black text-white p-8">
        	{user && (
        	<div className="max-w-3xl mx-auto">
            
            	<div className="flex items-center space-x-6 mb-8">
            	<img
              		src={`${baseAvatarURL}${user.avatar}`}
              		alt="User's avatar"
              		className="w-32 h-32 rounded-full"
            	/>
          		<div>
            	<h1 className="text-1xl font-bold flex items-center space-x-2">
                	{user.username}
                	<img    
                    	src={`${baseIconURL}${user.country}.png`}
                    	alt={`${user.country} flag`} 
                    	className="w-4 h-3 inline-block ml-1" 
                	/>
            	</h1>
          		</div>
        	</div>
        {storage !== null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{user.country}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>{user.creationdate}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <File className="w-5 h-5 text-gray-400" />
              <span>{storage.amt} files uploaded</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Storage used</span>  
                <span>{storage.total} GB / 10 GB</span>
              </div>
            
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(storage.total / 10) * 100}%` }}></div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-gray-400" />
              <span>{remaining} GB available</span>
            </div>
          </div>
        
        </div>
            ) : (
              <p>Loading data</p>
            )}

		<main className="max-w-7xl mx-auto p-4">
        <h2 className="text-xl font-semibold mb-6">{user.username}'s videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
		{metadata && metadata.length > 0 ? (
          metadata.map((video) => (
            <div
              key={video.id}
              className="relative group cursor-pointer"
              onClick={() => navigate(`/video/${video.id}`)}
            >
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img
                  src={thumbnailBaseURL + video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-16 h-16 text-white opacity-80" />
                  </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="mt-2">
                <h3 className="font-semibold truncate">{video.title}</h3>
                <div className="flex items-center text-xs text-white/60 mt-1 space-x-2">
                  <span>{video.views} views</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <Heart className="w-3 h-3 mr-1" />
                    {video.likes}
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Comments
                  </div>
                </div>
              </div>
            </div>
          ))
		) : (
			<div className="container mx-auto">
				<p className="text-center mb-5">No videos uploaded yet</p>
			</div>
		)}
        </div>
      </main>
      </div>
      )}
    </div>
  )
};
