package models

type PaginationParams struct {
	Page      int    `json:"page"`
	Limit     int    `json:"limit"`
	SortBy    string `json:"sortBy"`
	SortOrder string `json:"sortOrder"`
}

type FilterParams struct {
	Page      int     `json:"page"`
	PageSize  int     `json:"pageSize"`
	MinPrice  float64 `json:"minPrice"`
	MaxPrice  float64 `json:"maxPrice"`
	Type      string  `json:"type"`
	SortBy    string  `json:"sortBy"`
	SortOrder string  `json:"sortOrder"`
}

type PaginatedResponse struct {
	Products   []Product `json:"products"`
	Total      int       `json:"total"`
	Page       int       `json:"page"`
	PageSize   int       `json:"pageSize"`
	TotalPages int       `json:"totalPages"`
}
