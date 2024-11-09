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
	"reflect"

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
	visibility := c.FormValue("visibility")
	
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

		proccessVideo(title, username, filePath, visibility, fileSize)
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
	err := database.DB.QueryRow(context.Background(), "SELECT v.id, v.title, v.thumbnail, v.duration, COUNT(c.id) AS comment_count FROM videos v LEFT JOIN comments c ON v.id = c.video_id WHERE v.id = $1 GROUP BY v.id, v.title, v.thumbnail, v.duration;", videoID).
		Scan(&metadata.ID, &metadata.Title, &metadata.Thumbnail, &metadata.Duration, &metadata.Comments)
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Video not found"})
	}
	key := fmt.Sprintf("video:%s:likes", videoID)
	likes, err := database.RDB.Get(context.Background(), key).Int()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}
	metadata.Likes = likes

	key = fmt.Sprintf("video:%s:views", videoID)
	views, err := database.RDB.Get(context.Background(), key).Int()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}
	metadata.Views = views

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
	user := c.Get("username").(string)
	username := c.Param("id")
	var videos []models.VideoMetadata

	var query string
	if user == username {
		query = "SELECT v.id, v.title, v.thumbnail, v.duration, COUNT(c.id) AS comment_count FROM videos v LEFT JOIN comments c ON v.id = c.video_id WHERE v.username = $1 GROUP BY v.id, v.title, v.thumbnail, v.duration"
	} else {
		query = "SELECT v.id, v.title, v.thumbnail, v.duration, COUNT(c.id) AS comment_count FROM videos v LEFT JOIN comments c ON v.id = c.video_id WHERE v.username = $1 AND visibility = false GROUP BY v.id, v.title, v.thumbnail, v.duration"
	}
	
	rows, err := database.DB.Query(context.Background(), query, username)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve videos"})
	}
	defer rows.Close()

	for rows.Next() {
		var video models.VideoMetadata
		err := rows.Scan(&video.ID, &video.Title, &video.Thumbnail, &video.Duration, &video.Comments)
		if err != nil {
			fmt.Printf("Error scanning meta data: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error scanning video data"})
		}
		fmt.Println(video.ID)
		key := fmt.Sprintf("video:%d:likes", video.ID)
		likes, err := database.RDB.Get(context.Background(), key).Int()
		if err != nil {
			fmt.Println(reflect.TypeOf(video.ID))
			return c.JSON(http.StatusInternalServerError, err)
		}
		video.Likes = likes

		key = fmt.Sprintf("video:%d:views", video.ID)
		views, err := database.RDB.Get(context.Background(), key).Int()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err)
		}
		video.Views = views
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
	//username := "based"
	videoID := c.Param("id")
	
	key := fmt.Sprintf("video:%s:likes", videoID)
	database.RDB.Incr(context.Background(), key).Err()

	
	return c.JSON(http.StatusOK, echo.Map{"message": "Like added successfully"})
}

func unlikeVideo(c echo.Context) error {
	//username := "based"
	videoID := c.Param("id")
	
	key := fmt.Sprintf("video:%s:likes", videoID)
	database.RDB.Decr(context.Background(), key).Err()

	
	return c.JSON(http.StatusOK, echo.Map{"message": "Like added successfully"})
}

func getLikes(c echo.Context) error {
	videoID := c.Param("id")

	key := fmt.Sprintf("video:%s:likes", videoID)
	likes, err := database.RDB.Get(context.Background(), key).Int()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}
	return c.JSON(http.StatusOK, likes)
}

func viewVideo(c echo.Context) error {
	videoID := c.Param("id")
	
	key := fmt.Sprintf("video:%s:views", videoID)
	database.RDB.Incr(context.Background(), key).Err()

	
	return c.JSON(http.StatusOK, echo.Map{"message": "Video viewed successfully"})
}

func getViews(c echo.Context) error {
	videoID := c.Param("id")

	key := fmt.Sprintf("video:%s:views", videoID)
	views, err := database.RDB.Get(context.Background(), key).Int()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}
	return c.JSON(http.StatusOK, views)
}

func deleteVideo(c echo.Context) error {
	id := c.Param("id")

	_, err := database.DB.Exec(context.Background(), "DELETE FROM videos WHERE id=$1", id)
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Error deleting videos"})
	}
	return c.JSON(http.StatusOK, echo.Map{"message": "Video deleted successfully"})
}