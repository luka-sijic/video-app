import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUp } from 'lucide-react'

type DM = {
	id: number,
  	text: string,
  	sender: string
  	timestamp: string
}

const users = [
  { id: 1, name: 'Pranathi', avatar: '/lol.jpg?height=40&width=40', color: 'text-blue-400' },
  { id: 2, name: 'Rauno', avatar: '/placeholder.svg?height=40&width=40', color: 'text-red-400' },
  { id: 3, name: 'Alice', avatar: '/placeholder.svg?height=40&width=40', color: 'text-green-400' },
  { id: 4, name: 'Bob', avatar: '/placeholder.svg?height=40&width=40', color: 'text-yellow-400' },
]

//const conversations = [
//  { id: 1, user1: 'based', user2: ''}
//]

const DMPage: React.FC = () => {
  const [dm, setDM] = useState<DM[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState(users[0])
  const [newMessage, setNewMessage] = useState('')

    useEffect(() => {
        const token = localStorage.getItem('token');
        const url = 'https://basedgroup.com/api/dm';

        const fetchData = async () => {
            try {
                const response = await axios.get(url, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });

                console.log("Response data:", response.data);
                if (Array.isArray(response.data)) {
                  setDM(response.data)
                } else {
                  setError("API did not return an array");
                }
            } catch (error) {
                setError((error as Error).message);
            }
        };

      fetchData();
    }, []);

    if (error) return <p>Error: {error}</p>;

    return (
      <div className="flex h-screen bg-black text-white">
        <div className="w-1/4 border-r border-gray-800 p-4">
          <h2 className="text-xl font-bold mb-4">Direct Messages</h2>
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer ${
                selectedUser.id === user.id ? 'bg-gray-800' : 'hover:bg-gray-900'
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
              <span className={user.color}>{user.name}</span>
            </div>
          ))}
        </div>
  
        {/* Chat window */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="border-b border-gray-800 p-4">
            <h3 className="text-lg font-semibold">Chat with {selectedUser.name}</h3>
          </div>
  
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {dm.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'based' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-xs lg:max-w-md">
                  {message.sender !== 'You' && (
                    <div className={`text-xs mb-1 ${selectedUser.color}`}>
                      {selectedUser.name}
                    </div>
                  )}
                  <div className="relative">
                    {message.sender !== 'You' && (
                      <div 
                        className={`absolute -left-1 top-0 w-0 h-0 border-t-[6px] border-r-[6px] border-b-[6px] 
                        border-t-transparent border-b-transparent ${selectedUser.color.replace('text', 'border-r')}`}
                      ></div>
                    )}
                    <div className="bg-gray-800 rounded-lg p-3 text-sm">
                      {message.text}
                      {message.sender === 'You' && (
                        <button className="ml-2 text-gray-400 hover:text-white">
                          <ArrowUp size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
  
          {/* Message input */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center bg-gray-800 rounded-full">
              <input
                type="text"
                placeholder="Message..."
                className="flex-1 bg-transparent p-2 px-4 focus:outline-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter'}
              />
              <button 
                className="p-2 text-blue-400 hover:text-blue-300"
              >
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

export default DMPage;