package repositories

import (
	"PRODUCT_LIST/domain/models"
	"database/sql"
	"log"
)

type PostgresProductRepository struct {
	db *sql.DB
}

// Create implements models.ProductRepository.
func (r *PostgresProductRepository) Create(product *models.Product) error {
	// Add logging to see what's being received
	log.Printf("Attempting to create product with image URL: %s", product.ImageURL)

	query := `
	INSERT INTO products (name, type, price, description, image_url)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING id`

	err := r.db.QueryRow(
		query,
		product.Name,
		product.Type,
		product.Price,
		product.Description,
		product.ImageURL,
	).Scan(&product.ID)

	if err != nil {
		log.Printf("Error creating product: %v", err)
		return err
	}

	// Add logging to verify the insert
	log.Printf("Successfully created product with ID: %d", product.ID)
	return nil
}

// Delete implements models.ProductRepository.
func (r *PostgresProductRepository) Delete(id int) error {
	panic("unimplemented")
}

// GetByID implements models.ProductRepository.
func (r *PostgresProductRepository) GetByID(id int) (*models.Product, error) {
	panic("unimplemented")
}

// Search implements models.ProductRepository.
func (r *PostgresProductRepository) Search(name string) ([]models.Product, error) {
	panic("unimplemented")
}

// Update implements models.ProductRepository.
func (r *PostgresProductRepository) Update(product *models.Product) error {
	panic("unimplemented")
}

func NewProductRepository(db *sql.DB) *PostgresProductRepository {
	return &PostgresProductRepository{db: db}
}

func (r *PostgresProductRepository) GetAll(page int, sortBy string) ([]models.Product, error) {
	offset := (page - 1) * 10
	query := `SELECT id, name, type, price, description, image_url 
              FROM products 
              ORDER BY CASE 
                WHEN $2 = 'price_asc' THEN price END ASC,
                WHEN $2 = 'price_desc' THEN price END DESC,
                WHEN $2 = 'name' THEN name END ASC
              LIMIT 10 OFFSET $1`

	rows, err := r.db.Query(query, offset, sortBy)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		err := rows.Scan(&p.ID, &p.Name, &p.Type, &p.Price, &p.Description, &p.ImageURL)
		if err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, nil
}
