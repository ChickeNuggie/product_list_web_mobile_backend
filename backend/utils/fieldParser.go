package utils

import (
	"fmt"
	"strconv"
	"strings"
)

// Capitalized = Public/Exported
// Lowercase = Private/Unexported
// Helper functions in controller
func ParsePrice(priceStr string) (float64, error) {
	priceStr = strings.TrimSpace(priceStr)
	if priceStr == "" {
		return 0, fmt.Errorf("price is required")
	}

	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid price format: must be a number")
	}

	if price <= 0 {
		return 0, fmt.Errorf("price must be greater than 0")
	}

	return price, nil
}
