import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await registerUser(username, password);
   
            if (response.status === 201) {
                navigate('/login');
            } 
        } catch (err) {
            setError('Registration failed. Please check your username and password.');
        }
    }

    return (
        <div className="min-h-5 bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <div className="w-auto h-10 text-white">
                {/* Replace with your actual logo */}
                <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
                </svg>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Register an account
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
    
    
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 transition-colors"
                  >
                    Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
    )
}
