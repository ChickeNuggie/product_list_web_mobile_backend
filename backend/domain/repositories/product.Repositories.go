package repositories

import (
	"PRODUCT_LIST/domain/models"
	"PRODUCT_LIST/utils"
	"database/sql"
	"fmt"
	"log"
	"regexp"
)

type PostgresProductRepository struct {
	db *sql.DB
}

// Create implements models.ProductRepository.
func (r *PostgresProductRepository) Create(product *models.Product) error {
	// Handle base64 image if present
	if product.Image != "" {
		imageURL, err := utils.SaveBase64Image(product.Image)
		if err != nil {
			log.Printf("Error saving image: %v", err)
			return err
		}
		product.ImageURL = imageURL
	}

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
	query := `DELETE FROM products WHERE id = $1`

	result, err := r.db.Exec(query, id)
	if err != nil {
		log.Printf("Error deleting productL %v", err)
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("product with ID %d not found", id)
	}

	return nil
}

// GetByID implements models.ProductRepository.
func (r *PostgresProductRepository) GetByID(id int) (*models.Product, error) {
	query := `SELECT id, name, type, price, description, image_url 
	FROM products 
	WHERE id = $1`

	product := &models.Product{}
	err := r.db.QueryRow(query, id).Scan(
		&product.ID,
		&product.Name,
		&product.Type,
		&product.Price,
		&product.Description,
		&product.ImageURL,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("product with ID %d not found", id)
	}
	if err != nil {
		log.Printf("Error getting product by ID: %v", err)
		return nil, err
	}

	return product, nil
}

// Search implements models.ProductRepository.
func (r *PostgresProductRepository) Search(name string) ([]models.Product, error) {
	// Remove special characters from search term into a new string
	searchTerm := regexp.MustCompile(`[^a-zA-Z0-9]+`).ReplaceAllString(name, "")

	query := `SELECT id, name, type, price, description, image_url 
			  FROM products 
			  WHERE regexp_replace(lower(name), '[^a-zA-Z0-9]+', '', 'g') 
			  LIKE lower($1)`
	//the above converts name to lowercase, removes non-alphanumeric characters, and then compares it to the provided search term.

	// Add wildcards for partial matching (matching any sequence of characters within name)
	searchTerm = "%" + searchTerm + "%"

	rows, err := r.db.Query(query, searchTerm)
	if err != nil {
		log.Printf("Error searching products: %v", err)
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var product models.Product
		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Type,
			&product.Price,
			&product.Description,
			&product.ImageURL,
		)
		if err != nil {
			log.Printf("Error scanning product row: %v", err)
			return nil, err
		}
		products = append(products, product)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}

// Update implements models.ProductRepository.
func (r *PostgresProductRepository) Update(product *models.Product) error {
	// Handle base64 image if present
	if product.Image != "" {
		imageURL, err := utils.SaveBase64Image(product.Image)
		if err != nil {
			log.Printf("Error saving image: %v", err)
			return err
		}
		product.ImageURL = imageURL
	}

	query := `
	UPDATE products
	SET name = $1, type = $2, price = $3, description = $4, image_url = $5
	WHERE id = $6
	`

	result, err := r.db.Exec(
		query,
		product.Name,
		product.Type,
		product.Price,
		product.Description,
		product.ImageURL,
		product.ID,
	)
	if err != nil {
		log.Printf("Error updating product: %v", err)
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("product with ID %d not found", product.ID)
	}
	return nil
}

func NewProductRepository(db *sql.DB) *PostgresProductRepository {
	return &PostgresProductRepository{db: db}
}

func (r *PostgresProductRepository) GetAll(page int, pageSize int) ([]models.Product, error) {
	// Calculate offset
	offset := (page - 1) * pageSize

	query := `
        SELECT id, name, type, price, description, image_url 
        FROM products 
        ORDER BY id 
        LIMIT $1 OFFSET $2`

	rows, err := r.db.Query(query, pageSize, offset)
	if err != nil {
		log.Printf("Error getting products: %v", err)
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var product models.Product
		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Type,
			&product.Price,
			&product.Description,
			&product.ImageURL,
		)
		if err != nil {
			log.Printf("Error scanning product row: %v", err)
			return nil, err
		}
		products = append(products, product)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}

// repository/product_repository.go
func (r *PostgresProductRepository) GetProducts(params models.FilterParams) (*models.PaginatedResponse, error) {
	// Build dynamic query
	baseQuery := `
        SELECT COUNT(*) OVER(), id, name, type, price, description, image_url, created_at 
        FROM products 
        WHERE 1=1`

	// Create slice for query parameters
	queryParams := make([]interface{}, 0)
	paramCount := 1

	// Add filter conditions
	if params.MinPrice > 0 {
		baseQuery += fmt.Sprintf(" AND price >= $%d", paramCount)
		queryParams = append(queryParams, params.MinPrice)
		paramCount++
	}

	if params.MaxPrice > 0 {
		baseQuery += fmt.Sprintf(" AND price <= $%d", paramCount)
		queryParams = append(queryParams, params.MaxPrice)
		paramCount++
	}

	if params.Type != "" {
		baseQuery += fmt.Sprintf(" AND type = $%d", paramCount)
		queryParams = append(queryParams, params.Type)
		paramCount++
	}

	// // Add sorting
	// if params.SortBy != "" {
	// 	validColumns := map[string]bool{
	// 		"price":      true,
	// 		"type":       true,
	// 		"created_at": true,
	// 		"id":         true,
	// 	}

	// 	if validColumns[params.SortBy] {
	// 		baseQuery += fmt.Sprintf(" ORDER BY %s", params.SortBy)
	// 		if params.SortOrder == "desc" {
	// 			baseQuery += " DESC"
	// 		} else {
	// 			baseQuery += " ASC"
	// 		}
	// 	}
	// } else {
	// 	baseQuery += " ORDER BY id ASC"
	// }

	// Add sorting with more robust validation
	sortColumns := map[string]string{
		"price":      "price",
		"type":       "type",
		"created_at": "created_at",
		"id":         "id",
		"name":       "name", // Added for completeness
	}

	// Default sorting if no valid sort column is provided
	sortColumn := "id"
	sortOrder := "ASC"

	// Validate and set sort column
	if params.SortBy != "" {
		if col, ok := sortColumns[params.SortBy]; ok {
			sortColumn = col
		}
	}

	// Validate sort order
	if params.SortOrder == "desc" {
		sortOrder = "DESC"
	}

	// Add sorting to query
	baseQuery += fmt.Sprintf(" ORDER BY %s %s", sortColumn, sortOrder)

	// Add pagination
	offset := (params.Page - 1) * params.PageSize
	baseQuery += fmt.Sprintf(" LIMIT $%d OFFSET $%d", paramCount, paramCount+1)
	queryParams = append(queryParams, params.PageSize, offset)

	// Execute query
	rows, err := r.db.Query(baseQuery, queryParams...)
	if err != nil {
		log.Printf("Error executing query: %v", err)
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	var total int

	for rows.Next() {
		var product models.Product
		err := rows.Scan(
			&total,
			&product.ID,
			&product.Name,
			&product.Type,
			&product.Price,
			&product.Description,
			&product.ImageURL,
			&product.CreatedAt,
		)
		if err != nil {
			log.Printf("Error scanning product row: %v", err)
			return nil, err
		}
		products = append(products, product)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	totalPages := (total + params.PageSize - 1) / params.PageSize

	return &models.PaginatedResponse{
		Products:   products,
		Total:      total,
		Page:       params.Page,
		PageSize:   params.PageSize,
		TotalPages: totalPages,
	}, nil
}
