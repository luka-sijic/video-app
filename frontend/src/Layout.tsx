import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
	return (
    	<>
    	<Navbar /> 
      	<div className="content">
        	<Outlet />
      	</div>
    	</>
	);
};

export default Layout;