import React, { useState, useEffect } from 'react';
import ActiveUsersWidget from '../widgets/activeusers';
import axios from 'axios';


type UserType = {
    id: number;
    username: string;
    password: string;
    credits: number;
    role: number;
    status: number;
    country: string;
    rating: number;
    avatar: string;
    creationdate: string;
};



const Users: React.FC = () => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const url = import.meta.env.VITE_AUTH_URL + '/users';
        const fetchData = async () => {
            try {
                const response = await axios.get<UserType[]>(url, {
                  headers: {
                    Authorization: `Bearer ${token}`, 
                  },
                })
      
                setUsers(response.data)
            } catch (error) {
                setError((error as Error).message);
            }
    };

    fetchData();
    }, []);


    if (error) return <p>Error: {error}</p>;

    return (
      <div className="flex justify-center p-6">
      <div className="flex space-x-6 max-w-5xl w-full">
      <ActiveUsersWidget />
        <div className="p-6 bg-black rounded-lg">
          <table className="w-full border-collapse">
            <caption className="mt-4 mb-2 text-sm text-gray-400 text-left">
              A list of users in the system.
            </caption>
            <thead>
              <tr className="border-b border-gray-800">
                <th className="w-[200px] text-left py-3 px-4 text-gray-400 font-medium">Username</th>
                <th className="w-[200px] text-left py-3 px-4 text-gray-400 font-medium">Credits</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Rating</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Country</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Date created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className="border-b border-gray-800 hover:bg-gray-900 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-100 font-medium"><a href={`profile/${user.username}`}>{user.username}</a></td>
                  <td className="py-3 px-4 text-gray-300">{user.credits}</td>
                  <td className="py-3 px-4 text-gray-300">{user.role}</td>
                  <td className="py-3 px-4 text-gray-300">{user.rating}</td>
                  <td className="py-3 px-4 text-gray-300">{user.country}</td>
                  <td className="py-3 px-4 text-gray-300">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-300">{user.creationdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    );
};

const StatusBadge = ({ status }: { status: number }) => {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
  switch (status) {
    case 1:
      return <span className={`${baseClasses} bg-green-500/10 text-green-500`}>Active</span>
    case 0:
      return <span className={`${baseClasses} bg-red-500/10 text-red-500`}>Inactive</span>
    case -1:
      return <span className={`${baseClasses} bg-yellow-500/10 text-yellow-500`}>Pending</span>
    default:
      return <span className={`${baseClasses} bg-gray-500/10 text-gray-400`}>{status}</span>
  }
}

export default Users;
