"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios";

// Helper function to generate a random color
const getRandomColor = () => {
  const colors = ["text-red-400", "text-blue-400", "text-green-400", "text-yellow-400", "text-purple-400", "text-pink-400", "text-indigo-400"]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Mock data for active users
const mockUsers = [
  { id: 1, name: "Alice Johnson", avatar: "/placeholder.svg?height=32&width=32" },
  { id: 2, name: "Bob Smith", avatar: "/placeholder.svg?height=32&width=32" },
  { id: 3, name: "Charlie Brown", avatar: "/placeholder.svg?height=32&width=32" },
  { id: 4, name: "Diana Prince", avatar: "/placeholder.svg?height=32&width=32" },
]

type UserData = {
    id: number;
    username: string;
    avatar: string;
}

export default function ActiveUsersWidget() {
  const [activeUsers, setActiveUsers] = useState<UserData[]>([]);
  const baseAvatarURL = import.meta.env.VITE_STATIC_URL + "/avatars/";

  useEffect(() => {
    const token = localStorage.getItem('token');
    const url = import.meta.env.VITE_AUTH_URL + '/users';
    const fetchData = async () => {
        try {
            const response = await axios.get<UserData[]>(url, {
              headers: {
                Authorization: `Bearer ${token}`, 
              },
            })
  
            setActiveUsers(response.data)
        } catch (error) {
            console.log(error);
        }
    };
    fetchData();
    }, []);

  /* Simulate new users joining
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeUsers.length < 8) {
        const newUser = {
          id: activeUsers.length + 1,
          name: `User ${activeUsers.length + 1}`,
          avatar: "/placeholder.svg?height=32&width=32",
        }
        setActiveUsers((prevUsers) => [...prevUsers, newUser])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [activeUsers])*/

  return (
    <Card className="w-full max-w-md bg-black text-white border-black">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Active Users</span>
          <Badge variant="secondary" className="bg-green-500 text-white">
            {activeUsers.length} online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          <AnimatePresence>
            {activeUsers.map((user) => (
              <motion.li
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center space-x-2"
              >
                <Avatar>
                  <AvatarImage src={`${baseAvatarURL}${user.avatar}`} alt={user.username} />
                  <AvatarFallback>{user.username.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className={`font-medium ${getRandomColor()}`}><a href={`profile/${user.username}`}>{user.username}</a></span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </CardContent>
    </Card>
  )
}