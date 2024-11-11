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

func uploadPfp(c echo.Context) error {
	username := c.Get("username").(string)
	file, err := c.FormFile("avatar")
	if err != nil {
		return err
	}

	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	// Generate a unique file name
	uniqueFileName := fmt.Sprintf("%d-%s", time.Now().Unix(), file.Filename)

	// Destination - Create directory if necessary
	uploadPath := "uploads/avatars"
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		return err
	}
	dstPath := filepath.Join(uploadPath, uniqueFileName)

	// Create destination file
	dst, err := os.Create(dstPath)
	if err != nil {
		return err
	}
	defer dst.Close()

	// Copy the uploaded file to the server destination
	if _, err = src.Seek(0, 0); err == nil {
		if _, err = dst.ReadFrom(src); err != nil {
			return err
		}
	}

	query := "UPDATE users SET avatar=$1 WHERE username=$2"
	_, err = database.DB.Exec(context.Background(), query, uniqueFileName, username)
	if err != nil {
		fmt.Println("FLAG ISSUE")
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