package server

import (
	"fmt"
	"app/database"
	"regexp"
    "os"
	"bytes"
	"context"
	"strings"
	"os/exec"
	"path/filepath"
)

func proccessVideo(filename, username, filePath string, fileSize int64) {
	go func() {
		thumbnailPath := filepath.Join("./uploads/thumbnails/" + filename + ".jpg")
		if err := generateThumbnail(filePath, thumbnailPath); err != nil {
			fmt.Println(err.Error())
		}
		thumbnailURL := fmt.Sprintf("%s.jpg", filename)

		// Get video duration
		duration, err := getVideoDuration(filePath)
		if err != nil {
			fmt.Println(err.Error())
		}

		_, err = database.DB.Exec(context.Background(), "INSERT INTO videos (title, size, username, thumbnail, duration) VALUES ($1,$2,$3,$4,$5)", filename, fileSize, username, thumbnailURL, duration)
		if err != nil {
			fmt.Println(err.Error())
		}
        
        query := "INSERT INTO activity (action, username) VALUES ($1,$2)"
        _, err = database.DB.Exec(context.Background(), query, "File uploaded: " + filename, username)
		if err != nil {
			fmt.Println(err.Error())
		}
	}()
}

func createHLSStream(filePath, title string) {
    outputPath := filepath.Join("streams", title)
    os.MkdirAll(outputPath, 0755)
    // FFmpeg command to create HLS stream
	cmd := exec.Command(
		"ffmpeg",
		"-i", filePath,
		"-profile:v", "baseline",
		"-level", "3.0",
		"-start_number", "0",
		"-hls_time", "10",
		"-hls_list_size", "0",
		"-f", "hls",
		filepath.Join(outputPath, "playlist.m3u8"),
	)

    cmd.Run()
}

// Function to parse FFmpeg output and extract duration
func parseDuration(output string) (string, error) {
    // Use regex to find the duration
    re := regexp.MustCompile(`(?i)Duration:\s*(\d+:\d+:\d+\.\d+)`)
    matches := re.FindStringSubmatch(output)

    if len(matches) > 1 {
        return strings.TrimSpace(matches[1]), nil
    }

    return "", fmt.Errorf("duration not found in FFmpeg output")
}

// Function to extract video duration using FFmpeg
func getVideoDuration(videoPath string) (string, error) {
	// FFmpeg command to get video info
    cmd := exec.Command("ffmpeg", "-i", videoPath)

    // Capture combined output 
    var output bytes.Buffer
    cmd.Stdout = &output
    cmd.Stderr = &output

    // Run the command
    err := cmd.Run()

    // Parse the output to find the "Duration" line
    duration, parseErr := parseDuration(output.String())
    if parseErr != nil {
        if err != nil {
            // Only print the warning if there's both an error and no duration found
            fmt.Println("Warning: FFmpeg returned an error, and the duration could not be found.")
		}
        return "", parseErr
    }

    return duration, nil
}

func generateThumbnail(videoPath string, thumbnailPath string) error {
    // FFmpeg command to extract a frame at 10 seconds and save it as a thumbnail
    cmd := exec.Command("ffmpeg", "-i", videoPath, "-ss", "00:00:02", "-vframes", "1", thumbnailPath)

    // Run the command and check for errors
    if err := cmd.Run(); err != nil {
    	return err
    }
    return nil
}