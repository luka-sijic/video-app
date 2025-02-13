package server 

import (
	"app/database"
	"github.com/labstack/echo/v4"
	"context"
	"fmt"
	"net/http"
	"os"
	"time"
	"path/filepath"
)

func changeCountry(c echo.Context) error {
	// Get country from post
	country := c.FormValue("country")
	username := c.Get("username").(string)

	query := "UPDATE users SET country=$1 WHERE username=$2"
	_, err := database.DB.Exec(context.Background(), query, country, username)
	if err != nil {
		fmt.Println("Error changing country")
	}
	return c.JSON(http.StatusOK, "File uploaded")
}

// Modified upload function using the global R2 client
func uploadPfp(c echo.Context) error {
	// Get username from context
	username := c.Get("username").(string)

	// Get the uploaded file
	file, err := c.FormFile("avatar")
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": "No file provided",
		})
	}

	// Open the uploaded file for reading
	src, err := file.Open()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Could not process file",
		})
	}
	defer src.Close()

	// Generate a unique filename that's URL-safe
	uniqueFileName := fmt.Sprintf("%d-%s", time.Now().UnixNano(),
		strings.ReplaceAll(file.Filename, " ", "-"))

	// Detect content type from the file's content
	buffer := make([]byte, 512)
	_, err = src.Read(buffer)
	if err != nil && err != io.EOF {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Could not process file",
		})
	}
	contentType := http.DetectContentType(buffer)

	// Reset the file reader to the beginning
	_, err = src.Seek(0, 0)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Could not process file",
		})
	}

	// Create the upload input using the global R2 client
	input := &s3.PutObjectInput{
		Bucket:      aws.String("storage"),
		Key:         aws.String("avatars/" + uniqueFileName),
		Body:        src,
		ContentType: aws.String(contentType),
	}

	// Upload to R2 using the global client
	_, err = database.R2.PutObject(context.TODO(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": "Failed to upload file",
		})
	}
	
	// get the avatar URL ready
	avatarURL := GetAvatarURL(uniqueFileName)

	// Update the user table with the avatar
	query := "UPDATE users SET avatar=$1 WHERE username=$2"
	_, err = database.DB.Exec(context.Background(), query, avatarURL, username)
	if err != nil {
		fmt.Println("Error changing country")
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Profile picture uploaded successfully",
		"file":    uniqueFileName,
	})
}

func changeUsername(c echo.Context) error {
	username := c.Get("username").(string)
	newusername := c.FormValue("username")

	query := "UPDATE users SET username=$1 WHERE username=$2"
	_, err := database.DB.Exec(context.Background(), query, newusername, username)
	if err != nil {
		fmt.Println("Error changing username")
	}
	return c.JSON(http.StatusOK, "Username changed")
}

// finish later
func changePassword(c echo.Context) error {
	//currentPass := c.FormValue("currentPassword")
	//newPass := c.FormValue("newPassword")

	//query := "SELECT password FROM "
	return c.JSON(http.StatusOK, "Not done")
}
