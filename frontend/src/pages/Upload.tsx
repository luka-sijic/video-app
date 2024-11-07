'use client'

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

const UploadVideoPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [visibility, setVisibility] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chunkSize = 5 * 1024 * 1024 // 70MB per chunk

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadStatus('')
      setUploadProgress(0)
    }
  }

  const uploadFile = async () => {
    if (!file) return

    const totalChunks = Math.ceil(file.size / chunkSize)
    let chunkIndex = 0

    for (let start = 0; start < file.size; start += chunkSize) {
      const chunk = file.slice(start, start + chunkSize)
      const formData = new FormData()
      formData.append('video', chunk);
      formData.append('chunkIndex', (chunkIndex + 1).toString())
      formData.append('totalChunks', totalChunks.toString())
      formData.append('fileName', file.name);
      formData.append('fileSize', file.size.toString());
      formData.append('title', title);
      console.log("Visibility:", visibility);
      formData.append('visibility', visibility);

      try {
        const token = localStorage.getItem('token')
        const response = await axios.post(import.meta.env.VITE_API_URL + '/upload', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!)
            setUploadProgress(Math.round(((chunkIndex * 100) + percentCompleted) / totalChunks))
          }
        })

        console.log(response.data.message)
        chunkIndex++

        setUploadStatus(`Uploaded chunk ${chunkIndex} of ${totalChunks}`)

        if (chunkIndex === totalChunks) {
          setUploadStatus(`Upload complete. Video ID: ${response.data.video_id}`)
          setFile(null)
          setTitle('')
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
      } catch (error) {
        console.error('Error uploading chunk:', error)
        setUploadStatus('Error uploading file')
        break
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setUploadStatus('')
      setUploadProgress(0)
    }
  }

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("Selected visibility:", e.target.value); // Log the selected value
    setVisibility(e.target.value);
  };

  return (
    <div className="min-h-5 bg-black text-white flex items-center justify-center p-4">
      <div className="upload-container w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Upload Video</h1>

        {/* Title Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Video Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            placeholder="Enter video title"
          />
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/20'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="video/*"
            ref={fileInputRef}
          />
          {file ? (
            <div className="mb-4">
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-white/60">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="mb-4">
              <Upload className="w-12 h-12 mx-auto mb-2 text-white/60" />
              <p className="text-lg mb-2">Drag and drop your video here</p>
              <p className="text-sm text-white/60">or</p>
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Select File
          </button>
        </div>
        <br />
          <select
            id="visibility"
            value={visibility}
            onChange={handleVisibilityChange}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
          >
            <option value="">Select Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        <div className="mt-6 flex justify-center">
          <button
            onClick={uploadFile}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
            disabled={!file || !title}
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Video
          </button>
        </div>
        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-md flex items-center ${
            uploadStatus.includes('complete') ? 'bg-green-500/20 text-green-400' : 
            uploadStatus.includes('Uploaded chunk') ? 'bg-blue-500/20 text-blue-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {uploadStatus.includes('complete') ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : uploadStatus.includes('Uploaded chunk') ? (
              <Upload className="w-5 h-5 mr-2 animate-bounce" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            <p>{uploadStatus}</p>
          </div>
        )}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-4">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-center mt-2">{uploadProgress}% Uploaded</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadVideoPage