package server 

import (
	"app/database"
	"app/models"
	"net/http"
	"context"
	"fmt"
	//"os"
	//"path/filepath"
	"github.com/labstack/echo/v4"
	//"time"
	"math"
)

type Activity struct {
	ID int `json:"id"`
	Action string `json:"action"`
	Username string `json:"username"`
	Actiontime string `json:"actiontime"`
}

func getProfile(c echo.Context) error {
    username := c.Param("id")
	
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

func getActivity(c echo.Context) error {
	username := c.Param("id")
	var activities []Activity

	query := "SELECT id, action, username, TO_CHAR(action_time, 'MM-DD-YY') AS formatted_date FROM activity WHERE username=$1"
	rows, err := database.DB.Query(context.Background(), query, username)
	if err != nil {
		fmt.Println("ACTIVITIES NOT FOUND")
	}
	defer rows.Close()
	for rows.Next() {
		var activity Activity
		err := rows.Scan(&activity.ID, &activity.Action, &activity.Username, &activity.Actiontime)
		if err != nil {
			fmt.Printf("Error scanning activity data: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error scanning activity data"})
		}
		activities = append(activities, activity)
	}

	if err = rows.Err(); err != nil {
		fmt.Println("Error 45")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Error processing activity data"})
	}

	if (activities == nil) {
        var activity Activity
        activity.ID = 1
        activity.Action = "No recent activity found"
        activity.Username = username
        activities = append(activities, activity)
    }

	return c.JSON(http.StatusOK, activities)
}

type vSize struct {
	Size int64
	Amt int `json:"amt"`
	Total float64 `json:"total"`
}

func getStorage(c echo.Context) error {
	username := c.Param("id")
	fmt.Println(username)
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
	v.Amt = len(vSizes)

	return c.JSON(http.StatusOK, v)
}
