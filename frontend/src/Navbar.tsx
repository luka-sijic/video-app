import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react"

interface DecodedToken {
	username: string;
}



const Navbar: React.FC = () => {
	const navigate = useNavigate();
	const [username, setUsername] = useState<string | null>(null);

  	useEffect(() => {
    	const token = localStorage.getItem('token');
    	try {
			if (token) {
      			const decodedToken = jwtDecode<DecodedToken>(token);
      			setUsername(decodedToken.username);
			}
    	} catch (error) {
      		console.error("Invalid token", error);
    	}
  	}, []);

	const handleSignOut = () => {
		localStorage.removeItem('token');
		navigate("/login");
	};
  	
	return (
    	<nav className="bg-black text-white p-4">
      		<div className="max-w-7xl mx-auto flex justify-between items-center">
       			<Link to="/"><h1 className="text-2xl font-bold">Basedgroup</h1></Link>
        		<div className="space-x-4">
          			<Link to="/" className="hover:text-gray-300">Home</Link>
          			<Link to="/upload" className="hover:text-gray-300">Upload</Link>
          			<Link to="/users" className="hover:text-gray-300">Users</Link>
          			{username ? (
          			<Link to={`/profile/${username}`} className="hover:text-gray-300">Profilez</Link>
          				) : (
            			<span>Loading...</span>
          			)}
          			<Link to="/settings" className="hover:text-gray-300">Settings</Link>
					<Button
      					variant="outline"
      					className="bg-black text-white hover:bg-red-600 hover:text-white border-red-600 transition-colors duration-300 px-2 py-1 text-sm"
						onClick={handleSignOut}
    				>
      				<LogOut className="mr-1 h-3 w-3" />
      					Sign Out
    				</Button>
        		</div>
      		</div>
    	</nav>
  	);
};

export default Navbar;
