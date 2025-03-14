package services

import (
	"PRODUCT_LIST/domain/models"
	"fmt"
)

type ProductService struct {
	repo models.ProductRepository
}

func NewProductService(repo models.ProductRepository) *ProductService {
	return &ProductService{repo: repo}
}

func (s *ProductService) GetProducts(page int, pageSize int) ([]models.Product, error) {
	return s.repo.GetAll(page, pageSize)
}

func (s *ProductService) GetPagedProducts(params models.FilterParams) (*models.PaginatedResponse, error) {
	if params.Page < 1 {
		params.Page = 1
	}
	if params.PageSize < 1 {
		params.PageSize = 5 // default page size
	}

	// Optional: Add validation for other params
	if params.MinPrice < 0 {
		params.MinPrice = 0
	}
	if params.MaxPrice > 0 && params.MaxPrice < params.MinPrice {
		params.MaxPrice = params.MinPrice
	}

	return s.repo.GetProducts(params)
}

func (s *ProductService) GetProductByID(id int) (*models.Product, error) {
	return s.repo.GetByID(id)
}

func (s *ProductService) Create(product *models.Product) error {
	return s.repo.Create(product)
}

func (s *ProductService) GetProduct(id int) (*models.Product, error) {
	return s.repo.GetByID(id)
}

func (s *ProductService) DeleteProduct(id int) error {
	return s.repo.Delete(id)
}

func (s *ProductService) UpdateProduct(product *models.Product) error {
	// Add validation
	if product.Name == "" {
		return fmt.Errorf("name cannot be empty")
	}
	if product.Type == "" {
		return fmt.Errorf("type cannot be empty")
	}
	if product.Price <= 0 {
		return fmt.Errorf("price must be greater than zero")
	}
	return s.repo.Update(product)
}

func (s *ProductService) SearchProducts(name string) ([]models.Product, error) {
	return s.repo.Search(name)
}
