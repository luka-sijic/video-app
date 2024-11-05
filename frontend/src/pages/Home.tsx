import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchVideoMetaData } from '../api/api'; 
import { Play, Heart, MessageSquare } from 'lucide-react';


type Metadata = {
  id: number;
	title: string;
	thumbnail: string;
	duration: string;
	likes: number;
	views: number;
};

export default function Home() {
  	const [metadata, setMetadata] = useState<Metadata[]>([]);
  	const [searchQuery, setSearchQuery] = useState('');
  	const [filteredVideos, setFilteredVideos] = useState<Metadata[]>([]);

  	const thumbnailBaseURL = import.meta.env.VITE_STATIC_URL + "/thumbnails/";
  	const navigate = useNavigate();

  	useEffect(() => {
		const fetchVideo = async () => {
    		try {
        		const response = await fetchVideoMetaData();
        		setMetadata(response);
				if (response && response.length > 0) {
					setFilteredVideos(response);
				} else {
					console.log("Videos are not available");
					setFilteredVideos([]);
				}	
      		} catch(error) {
        		console.error("error");
				return [];
      		}
    	}
    	fetchVideo()
  	}, [])

  	useEffect(() => {
		if (!metadata) {
		  setFilteredVideos([]);
		  return;
		}
	  
		const filtered = metadata.filter(video =>
		  video.title.toLowerCase().includes(searchQuery.toLowerCase())
		);
		setFilteredVideos(filtered);
	}, [searchQuery, metadata]);


  

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold"></h1>
          <input
            type="search"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black border border-white/20 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <h2 className="text-xl font-semibold mb-6">Your Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
		{filteredVideos && filteredVideos.length > 0 ? (
          filteredVideos.map((video) => (
            <div
              key={video.id}
              className="relative group cursor-pointer"
              onClick={() => navigate(`/video/${video.id}`)}
            >
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img
                  src={thumbnailBaseURL + video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-16 h-16 text-white opacity-80" />
                  </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="mt-2">
                <h3 className="font-semibold truncate">{video.title}</h3>
                <div className="flex items-center text-xs text-white/60 mt-1 space-x-2">
                  <span>{video.views} views</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <Heart className="w-3 h-3 mr-1" />
                    {video.likes}
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Comments
                  </div>
                </div>
              </div>
            </div>
		  ))
          ) : (
			<div className="container mx-auto">
				<p className="text-center mb-50">No videos uploaded yet</p>
			</div>
		)}
        </div>
      </main>
    </div>
  )
};
