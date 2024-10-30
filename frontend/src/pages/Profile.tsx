'use client'

import { useState, useEffect} from 'react';
import { MapPin, Calendar, File, HardDrive } from "lucide-react";
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
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

type ActivityData = {
    id: number;
    action: string;
    username: string;
    actiontime: string;
};

type StorageData = {
  amt: number;
  total: number;
};

interface DecodedToken {
	username: string;
}

export default function Profile({ userID }: { userID: string }) {
    const [user, setUser] = useState<UserType | null>(null);
    const [storage, setStorage] = useState<StorageData | null>(null);
    const [remaining, setRemaining] = useState<number | null>(null);
    const [activity, setActivity] = useState<ActivityData[]>([]);
    const [username, setUsername] = useState<string | null>(null);
    const baseAvatarURL = import.meta.env.VITE_STATIC_URL + "/avatars/";
    const baseIconURL = import.meta.env.VITE_STATIC_URL + "/icons/";
    const token = localStorage.getItem('token');


    useEffect(() => {
        const fetchData = async () => {
            try {
		if (token) {
			const decodedToken = jwtDecode<DecodedToken>(token);
			setUsername(decodedToken.username);
			console.log(decodedToken.username);
		}
                const response = await axios.get(authUrl + `/users/${userID}`, {
                  headers: {
                    Authorization: `Bearer ${token}`, 
                  },
                });
                setUser(response.data);

                const response3 = await axios.get(apiUrl + `/storage/${username}`);
                setStorage(response3.data);
                const res = response3.data as StorageData;
                setRemaining(10 - res.total);

                const response2 = await axios.get<ActivityData[]>(apiUrl + `/activity/${username}`, {
                    headers: {
                        Authorization: `Bearer ${token}`, 
                    }
                })
                setActivity(response2.data)
            } catch(error) {
                console.log("error");
            }
        };
    
        fetchData();
    }, []);


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

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activity.map((act) => (
              <div key={act.id} className="bg-gray-900 p-4 rounded-lg">
                <p>{act.action}</p>
                <p className="text-sm text-gray-400">{act.actiontime}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  )
};
