package controllers

import (
	"PRODUCT_LIST/domain/models"
	"PRODUCT_LIST/services"
	"encoding/json"
	"net/http"
	"strconv"
)

type ProductController struct {
	service *services.ProductService
}

func NewProductController(service *services.ProductService) *ProductController {
	return &ProductController{service: service}
}

func (c *ProductController) GetProducts(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page == 0 {
		page = 1
	}
	sortBy := r.URL.Query().Get("sortBy")

	products, err := c.service.GetProducts(page, sortBy)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(products)
}

func (c *ProductController) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var product models.Product
	// Decode the JSON body into the product struct
	err := json.NewDecoder(r.Body).Decode(&product)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	// Call the service to create the product
	err = c.service.Create(&product)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Return the created product with status 201 Created
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}
