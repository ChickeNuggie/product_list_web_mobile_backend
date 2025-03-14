package utils

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Capitalized = Public/Exported
// Lowercase = Private/Unexported
// Helper functions
func IsAllowedFileType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	return ext == ".jpg" || ext == ".jpeg" || ext == ".png"
}

func HandleFileUpload(file multipart.File, handler *multipart.FileHeader) (string, error) {
	// Check file type
	if !IsAllowedFileType(handler.Filename) {
		return "", fmt.Errorf("invalid file type. Only jpg, jpeg, png allowed")
	}

	// Generate unique filename
	filename := fmt.Sprintf("product-%d%s",
		time.Now().UnixNano(),
		filepath.Ext(handler.Filename))

	// Create uploads directory if it doesn't exist, else won't register in database as string.
	if err := os.MkdirAll("uploads", 0755); err != nil {
		return "", fmt.Errorf("error creating upload directory: %v", err)
	}

	// Create the file
	dst, err := os.Create(filepath.Join("uploads", filename))
	if err != nil {
		return "", fmt.Errorf("error creating file: %v", err)
	}
	defer dst.Close()

	// Copy the uploaded file
	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("error saving file: %v", err)
	}

	return "/uploads/" + filename, nil
}
