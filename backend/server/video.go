package server 

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"context"
	"time"
	//"log"
	//"strconv"
	"github.com/labstack/echo/v4"
	"strings"

	"app/database"
	"app/models"
)

var videoDB = map[string]models.Video{}

func uploadVideo(c echo.Context) error {
	username := c.Get("username").(string)

	uploadedFile, err := c.FormFile("video")
	if err != nil {
		return err
	}
	
	title := c.FormValue("title")
	chunkIndex := c.FormValue("chunkIndex")
	totalChunks := c.FormValue("totalChunks")
	//filesize := c.FormValue("fileSize")
	filename := c.FormValue("fileName")
	
	/*
	fsize, err := strconv.Atoi(filesize)
	if err != nil {
		log.Println(err)
	}
	if (fsize > 100*1024*1024*1024) {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": "File is too large. Must be below 100MB",
		})
	}*/
	
	if !strings.HasSuffix(filename, ".mp4") {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": "Invalid file type. Only .mp4s are allowed",
		})
	}

	if !strings.HasSuffix(title, ".mp4") {
		title += ".mp4"
	}

	uploadsDir := "./uploads"
	if err := os.MkdirAll(uploadsDir, os.ModePerm); err != nil {
		return err
	}

	filePath := filepath.Join(uploadsDir, title)

	dst, err := os.OpenFile(filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer dst.Close()

	src, err := uploadedFile.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	if _, err = io.Copy(dst, src); err != nil {
		return err
	}

	if chunkIndex == totalChunks {
		fileInfo, err := dst.Stat()
		if err != nil {
			return err
		}
		fileSize := fileInfo.Size()

		videoID := fmt.Sprintf("%06d", len(videoDB)+1)

		videoMetadata := models.Video{
			ID:          videoID,
			Filename:    title,
			Filesize:    fileSize,
			Username:    username,
			DateUploaded: time.Now(),
		}
		videoDB[videoID] = videoMetadata
		
		proccessVideo(title, username, filePath, fileSize)
		createHLSStream(filePath, title)

		return c.JSON(http.StatusOK, echo.Map{
			"message": "File uploaded successfully",
			"video_id": videoID,
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Chunk uploaded successfully",
	})
}


func getVideoMetadata(c echo.Context) error {
	videoID := c.Param("id")

	var metadata models.VideoMetadata
	err := database.DB.QueryRow(context.Background(), "SELECT v.id, v.title, v.thumbnail, v.duration, COUNT(l.id) AS likes, v.views FROM videos v LEFT JOIN likes l ON v.id = l.video_id WHERE v.id = $1 GROUP BY v.id, v.title, v.thumbnail, v.duration, v.views", videoID).
		Scan(&metadata.ID, &metadata.Title, &metadata.Thumbnail, &metadata.Duration, &metadata.Likes, &metadata.Views)
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Video not found"})
	}
	return c.JSON(http.StatusOK, metadata)
}

type CommentRequest struct {
    Text string `json:"text"`
}

func sendComment(c echo.Context) error {
	videoID := c.Param("id")
	username := c.Get("username").(string)

	var req CommentRequest
    if err := c.Bind(&req); err != nil {
        return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid request body"})
    }

    content := req.Text
	fmt.Println("Content: ", content)
	if content == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Comment can't be empty"})
	}
	
	_, err := database.DB.Exec(context.Background(), "INSERT INTO comments (content, username, video_id) VALUES ($1,$2,$3)", content, username, videoID )
	if err != nil {
        return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Error adding comment"})
    }

	return c.JSON(http.StatusOK, echo.Map{"message": "Comment added successfully"})
}

func getComments(c echo.Context) error {
	videoID := c.Param("id")
	var comments []models.Comment

	rows, err := database.DB.Query(context.Background(), "SELECT id, content, username, likes, video_id FROM comments WHERE video_id=$1", videoID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve comments"})
	}
	defer rows.Close()

	for rows.Next() {
		var comment models.Comment
		err := rows.Scan(&comment.ID, &comment.Content, &comment.Username, &comment.Likes, &comment.VideoID)
		if err != nil {
			fmt.Printf("Error scanning comment: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error scanning comment data"})
		}
		comments = append(comments, comment)
	}

	if err = rows.Err(); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error processing comment data"})
	}

	return c.JSON(http.StatusOK, comments)
}

func getHomePage(c echo.Context) error {
	//username := c.Get("username").(string)
	username := c.Param("id")
	var videos []models.VideoMetadata

	rows, err := database.DB.Query(context.Background(), "SELECT v.id, v.title, v.thumbnail, v.duration, COUNT(l.id) AS likes, v.views FROM videos v LEFT JOIN likes l ON v.id = l.video_id WHERE v.username = $1 GROUP BY v.id, v.title, v.thumbnail, v.duration, v.views ORDER BY v.id", username)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve videos"})
	}
	defer rows.Close()

	for rows.Next() {
		var video models.VideoMetadata
		err := rows.Scan(&video.ID, &video.Title, &video.Thumbnail, &video.Duration, &video.Likes, &video.Views)
		if err != nil {
			fmt.Printf("Error scanning meta data: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error scanning video data"})
		}
		videos = append(videos, video)
	}

	if err = rows.Err(); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error processing comment data"})
	}

	return c.JSON(http.StatusOK, videos)
}

func getVideo(c echo.Context) error {
	videoID := c.Param("id")
	var title string 
	err := database.DB.QueryRow(context.Background(), "SELECT title FROM videos WHERE id=$1", videoID).
		Scan(&title)
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Video not found"})
	}

	_, err = database.DB.Exec(context.Background(), "UPDATE videos SET views = views + 1 WHERE id = $1", videoID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Error updating view count"})
	}

	videoPath := filepath.Join("uploads/", title)
	

	return c.File(videoPath)
}

func likeVideo(c echo.Context) error {
	username := "based"
	videoID := c.Param("id")
	fmt.Println(videoID)

	_, err := database.DB.Exec(context.Background(), "INSERT INTO likes (username, video_id) VALUES ($1,$2)", username, videoID)
	if err != nil {
		fmt.Println(err)
        return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Error adding like"})
    }
	return c.JSON(http.StatusOK, echo.Map{"message": "Like added successfully"})
}
