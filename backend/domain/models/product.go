// models/product.go
package models

import "time"

type Product struct {
	ID          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Type        string    `json:"type" db:"type"`
	Price       float64   `json:"price" db:"price"`
	Description string    `json:"description" db:"description"`
	ImageURL    string    `json:"image_url" db:"image_url"`
	Image       string    `json:"image,omitempty"` // for base64 data
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type ProductRepository interface {
	GetAll(page int, pageSize int) ([]Product, error)
	GetProducts(params FilterParams) (*PaginatedResponse, error)
	GetByID(id int) (*Product, error)
	Create(product *Product) error
	Update(product *Product) error
	Delete(id int) error
	Search(name string) ([]Product, error)
}
