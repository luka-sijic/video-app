import React from 'react'
import { BrowserRouter as Router, Route, Routes, useParams, Navigate, Outlet } from 'react-router-dom';
import Users from './pages/Users';
import Home from './pages/Home';
import DMPage from './pages/DMPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadVideoPage from './pages/Upload';
import Video from './pages/Video';
import Layout from './Layout';
//import Admin from './pages/Admin';
import NotFoundPage from './pages/NotFound';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import './App.css';
import './index.css';

const PrivateRoute : React.FC = () => {
	const isAuth = localStorage.getItem('token') !== null;
  	return isAuth ? <Outlet /> : <Navigate to="/login" />;
}


//<Route path="/admin" element={<Admin />} />

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<Layout />}>
            <Route path="/video/:videoID" element={<VideoWrapper />} />
            <Route path="/profile/:userID" element={<ProfileWrapper />} />
          </Route>
          
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
            <Route path="/upload" element={<UploadVideoPage />} />
            <Route path="/users" element={<Users />} />
            <Route path="/home" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dm" element={<DMPage />} />
            <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

        </Routes>
      </Router>
    );
}

function VideoWrapper() {
	const { videoID } = useParams<{ videoID: string }>() // Get videoID from the route parameter
	return <Video videoID={videoID ?? ''} /> // Pass the videoID prop to the Video component
}

function ProfileWrapper() {
  	const { userID } = useParams<{ userID: string }>() // Get videoID from the route parameter
  	return <Profile userID={userID ?? ''} /> // Pass the videoID prop to the Video component
}

export default App
