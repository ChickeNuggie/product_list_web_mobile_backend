package services

import (
	"PRODUCT_LIST/domain/models"
)

type ProductService struct {
	repo models.ProductRepository
}

func NewProductService(repo models.ProductRepository) *ProductService {
	return &ProductService{repo: repo}
}

func (s *ProductService) GetProducts(page int, sortBy string) ([]models.Product, error) {
	return s.repo.GetAll(page, sortBy)
}

func (s *ProductService) Create(product *models.Product) error {
	return s.repo.Create(product)
}
