'use client'

import { useState, useEffect } from 'react';
import { MessageSquare, Share2, Heart } from 'lucide-react';
import { HelmetProvider } from 'react-helmet-async';
import { jwtDecode } from "jwt-decode";
const apiUrl = import.meta.env.VITE_API_URL;
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React from 'react';
import 'hls-video-element';

type Comment = {
  	id: number;
  	content: string;
  	username: string;
  	video_id: string;
};

interface DecodedToken {
	username: string;
}

export default function Video({ videoID }: { videoID: string }) {
  	const [metadata, setMetadata] = useState<any>(null);
  	const [comments, setComments] = useState<Comment[]>([]);
  	const [newComment, setNewComment] = useState<string>("");
  	const [error, setError] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);


  	const videoSrc = import.meta.env.VITE_API_URL;
  	const token = localStorage.getItem('token');
	  const navigate = useNavigate();


  	useEffect(() => {

    	const fetchVideo = async () => {
        	try {
            	const metadataResponse = await axios.get(import.meta.env.VITE_API_URL + `/video/${videoID}/metadata`);
            	setMetadata(metadataResponse.data);

              await axios.post(import.meta.env.VITE_API_URL + `/video/${videoID}/view`);

            	const commentResponse = await axios.get<Comment[]>(import.meta.env.VITE_API_URL + `/video/${videoID}/comment`);
            	setComments(commentResponse.data);
              if (commentResponse.data == null) {
                setMetadata((prevMetadata: any) => ({
                  ...prevMetadata,
                  comments: 0
                }));
              } else {
                setMetadata((prevMetadata: any) => ({
                  ...prevMetadata,
                  comments: commentResponse.data.length
                }));
              }

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
			  if(token) {
				  const decodedToken = jwtDecode<DecodedToken>(token);
				  await axios.post(
					  apiUrl + `/video/${videoID}/comment`, 
					  {
						  username: decodedToken.username, 
						  text: newComment,
					  },
					  {
						  headers: {
                Authorization: `Bearer ${token}`,
              },
					  }
				  );
          const resp = await axios.get(import.meta.env.VITE_API_URL + `/video/${videoID}/comment`, {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          })
          setComments(resp.data);
          setMetadata((prevMetadata: any) => ({
            ...prevMetadata,
            comments: resp.data.length
          }));
          console.log(resp.data.length);
          setNewComment('');
			  } else {
				  console.log("No token found, redirecting to login...");
				  navigate('/login'); // Redirect to login page
			  }
    	} catch (error) {
        	console.error("Error posting comment:", error);
    	}
	};


  const handleLikeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isLiked == true) {
        await axios.post(import.meta.env.VITE_API_URL + `/video/${videoID}/unlike`, {}, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        })
      } else {
        await axios.post(import.meta.env.VITE_API_URL + `/video/${videoID}/like`, {}, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        })
      }

      setIsLiked(!isLiked);

      const resp = await axios.get(import.meta.env.VITE_API_URL + `/video/${videoID}/likes`, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      })
      setMetadata((prevMetadata: any) => ({
        ...prevMetadata,
        likes: resp.data
      }));
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
          <meta property="og:url" content={videoSrc + `/video/${metadata.id}`} />
          <meta property="og:title" content={metadata.name} />
          <meta name="description" content="video" />
          <meta property="og:description" content="video" />
          <meta property="og:image" content={videoSrc + `/thumbnails/${metadata.thumbnail}`} />
          <meta property="og:video" content={videoSrc + `/video/${metadata.id}`} />
          <meta property="og:video:secure_url" content={videoSrc + `/video/${metadata.id}`} />
          <meta property="og:video:width" content="640" />
          <meta property="og:video:height" content="360" />
          <meta property="og:video:type" content="video/mp4" />
        </HelmetProvider>
      )}
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-4">
        {/* Video Player */}
        <div className="relative aspect-video w-full h-full max-w-full bg-black rounded-lg overflow-hidden">
          {metadata ? (
            <hls-video
              src={videoSrc + `/streams/${metadata.title}/playlist.m3u8`}
              controls 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'fill',
              }}
            ></hls-video>   
           // <HLSPlayer streamUrl={videoSrc + `/streams/${metadata.title}/playlist.m3u8`} />
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
                  <Heart 
                    className="w-5 h-5"
                    color={isLiked ? "red" : "currentColor"}
                    fill={isLiked ? "red" : "none"}
                  />
                  <span>{metadata.likes}</span>
                </button>
              </form>
              <button className="flex items-center space-x-1 hover:text-white transition">
                <MessageSquare className="w-5 h-5" />
                <span>{metadata.comments}</span>
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
			<br />
          <div className="space-y-5">
          {comments && comments.length > 0 ? (
  			comments.map((comment) => (
    		<div key={comment.id} className="bg-gray-800 rounded-lg p-5">
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
