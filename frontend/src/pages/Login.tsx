import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    const handleSubmit = async (e: React.FormEvent) => {
    	e.preventDefault(); 
  
      	try {
      		const response = await loginUser(username, password);
        	console.log(response.data)
        	if (response.status === 200) {
        		const { token } = response.data;
        		localStorage.setItem('token', token);
        		navigate('/');
        	}
      	} catch (err) {
    		setError('Login failed. Please check your username and password.');
      	}
    }
  
    return (
      <div className="min-h-50 bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-auto h-10 text-white">
              <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>
  
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-zinc-900 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {/* Form submission handler */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error message display */}
              {error && <p className="text-red-500">{error}</p>}
  
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-zinc-300">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-zinc-700 rounded-md shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm bg-zinc-800 text-white"
                  />
                </div>
              </div>
  
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-zinc-700 rounded-md shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm bg-zinc-800 text-white"
                  />
                </div>
              </div>
  
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-zinc-600 focus:ring-zinc-500 border-zinc-700 rounded bg-zinc-800"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-300">
                    Remember me
                  </label>
                </div>
  
                <div className="text-sm">
                  <a href="/forgot-password" className="font-medium text-zinc-300 hover:text-white transition-colors">
                    Forgot your password?
                  </a>
                </div>
              </div>
  
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-colors"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
};
