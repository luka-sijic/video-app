'use client'

import { useState, useEffect} from 'react';
import { MessageSquare, Share2, Heart } from 'lucide-react';
import ReactPlayer from 'react-player';
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios';
import React from 'react';

type Comment = {
  	id: number;
  	content: string;
  	username: string;
  	video_id: string;
};


export default function Video({ videoID }: { videoID: string }) {
  	const [metadata, setMetadata] = useState<any>(null);
  	const [comments, setComments] = useState<Comment[]>([]);
  	const [newComment, setNewComment] = useState<string>("");
  	const [error, setError] = useState<string | null>(null);


  	const videoSrc = import.meta.env.VITE_API_URL + `/video/${videoID}`;
  	const token = localStorage.getItem('token');

  	useEffect(() => {
    	const fetchVideo = async () => {
        	try {
            	const metadataResponse = await axios.get(import.meta.env.VITE_API_URL + `/video/${videoID}/metadata`);
            	setMetadata(metadataResponse.data);

            	const commentResponse = await axios.get<Comment[]>(import.meta.env.VITE_API_URL + `/video/${videoID}/comment`);
            	setComments(commentResponse.data);

        	} catch(error) {
            		console.error("error fetching the video", error);
            		setError('Failed to load comments');
        	}
    	}
    	fetchVideo();
  	}, [videoID])
  
  const handlePostComment = async () => {
    if (newComment.trim() === "") return;

    try {
        await axios.post(`/comments/${videoID}`, {
            username: "user", 
            text: newComment,
        });
        setNewComment(""); 
    } catch (error) {
        console.error("Error posting comment:", error);
    }
};


  const handleLikeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(import.meta.env.VITE_API_URL + `/video/${videoID}/like`, {}, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      })
    } catch (error) {
      console.error('Error liking video:', error)
    }
  }

  return (
    <>
    {metadata && (
        <HelmetProvider>
          <title>{metadata.name}</title>
          <meta property="og:type" content="video.other" />
          <meta property="og:url" content={`https://api.basedgroup.com/video/${metadata.id}`} />
          <meta property="og:title" content={metadata.name} />
          <meta property="og:description" content={"Watch this amazing video!"} />
          <meta property="og:image" content={`https://api.basedgroup.com/${metadata.thumbnail}`} />
          <meta property="og:video" content={`https://api.basedgroup.com/video/${metadata.id}`} />
          <meta property="og:video:secure_url" content="`https://api.basedgroup.com/video/${metadata.id}`" />
          <meta property="og:video:width" content="640" />
          <meta property="og:video:height" content="360" />
          <meta property="og:video:type" content="video/mp4" />
        </HelmetProvider>
      )}
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4">
        {/* Video Player */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
          {videoSrc ? (
            <ReactPlayer
              url={videoSrc}
              controls
              playing
              width="100%"
              height="100%"
              className="w-full h-full object-cover"
            />
          ) : (
            <p>Video is not available.</p>
          )}
        </div>

        {/* Video Info */}
        {metadata && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{metadata.name}</h1>
          <div className="flex items-center justify-between text-gray-400">
            <span>{metadata.views} views</span>
            <div className="flex items-center space-x-4">
              <form onSubmit={handleLikeSubmit}>
                <button className="flex items-center space-x-1 hover:text-white transition">
                  <Heart className="w-5 h-5" />
                  <span>{metadata.likes}</span>
                </button>
              </form>
              <button className="flex items-center space-x-1 hover:text-white transition">
                <MessageSquare className="w-5 h-5" />
                <span>456</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-white transition">
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Comments Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Comments</h2>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-grow bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handlePostComment}
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
              >
                Post
              </button>
            </div>
          <div className="space-y-4">
          {comments && comments.length > 0 ? (
  			comments.map((comment) => (
    		<div key={comment.id} className="bg-gray-800 rounded-lg p-4">
      			<div className="flex items-center justify-between mb-2">
        			<span className="font-semibold">{comment.username || 'Anonymous'}</span>
        		<button className="text-gray-400 hover:text-white transition">
          			<Heart className="w-4 h-4" />
        		</button>
      		</div>
      		<p className="text-gray-300">{comment.content}</p>
      			<div className="mt-2 text-sm text-gray-400">0 likes</div>
    		</div>
  			))
			) : (
  			<div className="text-gray-400 text-center mt-4">
    			No comments yet. Be the first to comment!
  			</div>
			)}
         
          </div>
	  {error && <div className="error-message">{error}</div>} 
        </div>
      </div>
    </div>
    </>
  );
};
