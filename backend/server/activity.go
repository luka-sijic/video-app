package server 

import (
	"app/database"
	"app/models"
	"net/http"
	"context"
	"fmt"
	"os"
	"path/filepath"
	"github.com/labstack/echo/v4"
	"time"
	"math"
)

type Activity struct {
	ID int `json:"id"`
	Action string `json:"action"`
	Username string `json:"username"`
	Actiontime string `json:"actiontime"`
}

func getProfile(c echo.Context) error {
    username := c.Get("username").(string)
	
    var user models.User
    err := database.DB.QueryRow(context.Background(), "SELECT id, username, credits, role, status, country, rating, avatar, TO_CHAR(creationDate, 'MM-DD-YY') AS formatted_date FROM users WHERE username=$1", username).
		Scan(&user.ID, &user.Username, &user.Credits, &user.Role, &user.Status, &user.Country, &user.Rating, &user.Avatar, &user.CreationDate)
    if err != nil {
		fmt.Println(err)
        return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
    }
    return c.JSON(http.StatusOK, user)
}

func userToID(username string) int {
	var id int 
	query := "SELECT id FROM users WHERE username=$1"
	err := database.DB.QueryRow(context.Background(), query, username).Scan(&id)
	if err != nil {
		fmt.Println("ITS A TRAP")
	}
	return id
}

func IdToUser(userid int) string {
	var username string
	query := "SELECT username FROM users WHERE id=$1"
	err := database.DB.QueryRow(context.Background(), query, userid).Scan(&username)
	if err != nil {
		fmt.Println("ITS A TRAP")
	}
	return username
}

/* getActivity(c echo.Context) error {
	userID := c.Param("id")
	var activities []Activity
	val, _ := strconv.Atoi(userID)

	username := IdToUser(val)

	query := "SELECT id, action, username, TO_CHAR(action_time, 'MM-DD-YY') AS formatted_date FROM activity WHERE username=$1"
	rows, err := database.DB.Query(context.Background(), query, username)
	if err != nil {
		fmt.Println("ACTIVITIES NOT FOUND")
	}
	defer rows.Close()

	for rows.Next() {
		var a1 Activity
		err := rows.Scan(&a1.ID, &a1.Action, &a1.Username, &a1.Actiontime)
		if err != nil {
			fmt.Printf("Error scanning activity data: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error scanning activity data"})
		}
		activities = append(activities, a1)
	}

	if err = rows.Err(); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error processing activity data"})
	}

	if (activities == nil) {
		var a1 Activity 
		a1.ID = val	
		a1.Action = "No recent activity found"
		a1.Username = username 
		activities = append(activities, a1)
	}

	return c.JSON(http.StatusOK, activities)
}*/

func getActivity(c echo.Context) error {
	username := c.Get("username").(string)
	var activities []Activity


	query := "SELECT id, action, username, TO_CHAR(action_time, 'MM-DD-YY') AS formatted_date FROM activity WHERE username=$1"
	rows, err := database.DB.Query(context.Background(), query, username)
	if err != nil {
		fmt.Println("ACTIVITIES NOT FOUND")
	}
	defer rows.Close()

	for rows.Next() {
		var a1 Activity
		err := rows.Scan(&a1.ID, &a1.Action, &a1.Username, &a1.Actiontime)
		if err != nil {
			fmt.Printf("Error scanning activity data: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error scanning activity data"})
		}
		activities = append(activities, a1)
	}

	if err = rows.Err(); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error processing activity data"})
	}

	return c.JSON(http.StatusOK, activities)
}

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

type vSize struct {
	Size int64
	Amt int `json:"amt"`
	Total float64 `json:"total"`
}
/*
func getStorage(c echo.Context) error {
	userID := c.Param("id")
	val2, _ := strconv.Atoi(userID)

	username := IdToUser(val2)
	var vSizes []vSize

	query := "SELECT size FROM videos WHERE username=$1"
	rows, err := database.DB.Query(context.Background(), query, username)
	if err != nil {
		fmt.Println("Error getting video sizes")
	}
	defer rows.Close()
	for rows.Next() {
		var v vSize
		err := rows.Scan(&v.Size)
		if err != nil {
			fmt.Println("Error scanning vsizes")
		}
		vSizes = append(vSizes, v)
	}
	if err = rows.Err(); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error processing video size data"})
	}
	var val int64 
	for i,_ := range vSizes {
		fmt.Println(vSizes[i])
		val += vSizes[i].Size
	}
	var v vSize
	var f float64 = float64(val)
	x := f / 1000000000
	f = math.Floor(x*100) / 100
	v.Total = f
	v.Amt = len(vSizes)

	return c.JSON(http.StatusOK, v)
}*/

func getStorage(c echo.Context) error {
	username := c.Get("username").(string)
	var vSizes []vSize

	query := "SELECT size FROM videos WHERE username=$1"
	rows, err := database.DB.Query(context.Background(), query, username)
	if err != nil {
		fmt.Println("Error getting video sizes")
	}

	defer rows.Close()
	
	for rows.Next() {
		var v vSize
		err := rows.Scan(&v.Size)
		if err != nil {
			fmt.Println("Error scanning vsizes")
		}
		vSizes = append(vSizes, v)
	}

	if err = rows.Err(); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error processing video size data"})
	}
	// Magic
	var val int64 
	for i,_ := range vSizes {
		//fmt.Println(vSizes[i])
		val += vSizes[i].Size
	}
	var v vSize
	var f float64 = float64(val)
	x := f / 1000000000
	f = math.Floor(x*100) / 100
	v.Total = f

	return c.JSON(http.StatusOK, v)
}