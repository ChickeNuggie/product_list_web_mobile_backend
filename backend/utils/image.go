package utils

import (
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Capitalized = Public/Exported
// Lowercase = Private/Unexported
func SaveBase64Image(base64String string) (string, error) {
	log.Printf("Received base64 string length: %d", len(base64String))
	if base64String == "" {
		return "", nil
	}

	// Remove data URI prefix if present
	base64Data := base64String
	if strings.Contains(base64String, ",") {
		base64Data = strings.Split(base64String, ",")[1]
	}

	// Decode base64 string
	decodedData, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return "", fmt.Errorf("error decoding base64: %v", err)
	}

	// Create uploads directory if it doesn't exist
	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", fmt.Errorf("error creating upload directory: %v", err)
	}

	// Generate unique filename
	filename := fmt.Sprintf("product-%d%s", time.Now().UnixNano(), ".png")
	filepath := filepath.Join(uploadDir, filename)

	// Save file
	if err := os.WriteFile(filepath, decodedData, 0644); err != nil {
		return "", fmt.Errorf("error saving file: %v", err)
	}

	// Return the relative path
	return fmt.Sprintf("/uploads/%s", filename), nil
}
