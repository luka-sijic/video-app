import React, { useState } from 'react';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_AUTH_URL;

export default function Settings() {
    const [country, setCountry] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const token = localStorage.getItem('token');



    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCountry = e.target.value;
        setCountry(selectedCountry);
        try {
            axios.post(apiUrl + "/country", {country: selectedCountry }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Bearer ${token}`, 
                },
            })
        } catch(error) {
            console.error("Error changing country")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };
    
    const handleUpload = () => {
        if (!selectedFile) {
            alert("Please select a file first.");
            return;
        }
    
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append("avatar", selectedFile);
    
        // Send a POST request to the backend with the file using Axios
        axios
          .post(apiUrl + "/uploadpfp", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`, 
            },
          })
          .then((response) => {
            console.log("Success:", response.data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      };

    return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-lg">Username</label>
            <div className="flex space-x-2">
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="flex-grow px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Change
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-lg">Profile Picture</label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input type="file" onChange={handleFileChange} />
              <button onClick={handleUpload} className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Upload New Picture
              </button> 
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="current-password" className="block text-lg">Change Password</label>
            <input
              id="current-password"
              type="password"
              placeholder="Current Password"
              className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              id="new-password"
              type="password"
              placeholder="New Password"
              className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm New Password"
              className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Update Password
            </button>
          </div>
          <div className="space-y-2">
            <label htmlFor="country" className="block text-lg">Country</label>
            <select
              id="country"
              value={country}
              onChange={handleCountryChange}
              className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your country</option>
              <option value="US">United States</option>
              <option value="CN">China</option>
              <option value="RU">Russia</option>
              <option value="RS">Serbia</option>
              <option value="SA">Saudi Arabia</option>
              <option value="VN">Vietnam</option>
              <option value="UA">Ukraine</option>
              <option value="FR">France</option>
              <option value="ES">Spain</option>
              <option value="TR">Turkey</option>
              <option value="MO">Macau</option>
            </select>
          </div>
        </div>
        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
          Save Changes
        </button>
      </div>
    </div>
  )
}
