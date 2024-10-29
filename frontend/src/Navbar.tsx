import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";





const Navbar: React.FC = () => {
	const [username, setUsername] = useState<string | null>(null);

  	useEffect(() => {
    	const token = localStorage.getItem('token');
    	try {
      		const decodedToken = jwtDecode(token);
      		setUsername(decodedToken.username);
    	} catch (error) {
      		console.error("Invalid token", error);
    	}
  	}, []);
  	
	return (
    	<nav className="bg-black text-white p-4">
      		<div className="max-w-7xl mx-auto flex justify-between items-center">
       			<Link to="/home"><h1 className="text-2xl font-bold">Basedgroup</h1></Link>
        		<div className="space-x-4">
          			<Link to="/home" className="hover:text-gray-300">Home</Link>
          			<Link to="/upload" className="hover:text-gray-300">Upload</Link>
          			<Link to="/users" className="hover:text-gray-300">Users</Link>
          			{username ? (
          			<Link to={`/profile/${username}`} className="hover:text-gray-300">Profile</Link>
          				) : (
            			<span>Loading...</span>
          			)}
          			<Link to="/settings" className="hover:text-gray-300">Settings</Link>
        		</div>
      		</div>
    	</nav>
  	);
};

export default Navbar;