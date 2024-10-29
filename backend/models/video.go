package models

import (
	"time"
)

type Video struct {
	ID string `json:"id"`
	Filename string `json:"filename"`
	Filesize int64 `json:"filesize"`
	Username string `json:"username"`
	DateUploaded time.Time `json:"dateUploaded`
}


type VideoMetadata struct {
	ID int `json:"id"`
	Title string `json:"title"`
	Thumbnail string `json:"thumbnail"`
	Duration string `json:"duration"`
	Likes int `json:"likes"`
	Views int `json:"views"`
}


type Comment struct {
	ID int `json:"id"`
	Content string `json:"content"`
	Username string `json:"username"`
	Likes int `json:"likes"`
	VideoID int `json:"vid"`
}