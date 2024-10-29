package models

import "time"

type Message struct {
	Username string `json:"username"`
	Message string `json:"message"`
	Timestamp time.Time `json:"timestamp"`
}

type DM struct {
	ID int `json:"id"`
	Text string `json:"text"`
	Sender string `json:"sender"`
	Sent time.Time `json:"timestamp"`
}