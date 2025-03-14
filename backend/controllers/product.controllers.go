package controllers

import (
	"PRODUCT_LIST/domain/models"
	"PRODUCT_LIST/services"
	"PRODUCT_LIST/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
)

type ProductController struct {
	service *services.ProductService
}

func NewProductController(service *services.ProductService) *ProductController {
	return &ProductController{service: service}
}

func (c *ProductController) GetProducts(w http.ResponseWriter, r *http.Request) {
	// Get pagination parameters from query string
	// Request arrives here after proxy forwarding
	page, err := strconv.Atoi(r.URL.Query().Get("page"))
	// ... handle the request
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if err != nil || pageSize < 1 {
		pageSize = 5 // default page size (change to 10 later)
	}

	products, err := c.service.GetProducts(page, pageSize)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := struct {
		Products []models.Product `json:"products"`
		Page     int              `json:"page"`
		PageSize int              `json:"pageSize"`
	}{
		Products: products,
		Page:     page,
		PageSize: pageSize,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (c *ProductController) GetProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	product, err := c.service.GetProduct(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

func (c *ProductController) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var product models.Product
	// Decode the JSON body into the product struct
	// err := json.NewDecoder(r.Body).Decode(&product)
	// if err != nil {
	// 	http.Error(w, err.Error(), http.StatusBadRequest)
	// 	return
	// }
	// // Call the service to create the product
	// err = c.service.Create(&product)
	// if err != nil {
	// 	http.Error(w, err.Error(), http.StatusInternalServerError)
	// 	return
	// }
	// // Return the created product with status 201 Created
	// w.WriteHeader(http.StatusCreated)
	// json.NewEncoder(w).Encode(product)
	// Parse multipart form
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Error parsing form data: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Parse and validate form fields
	product.Name = r.FormValue("name")
	product.Type = r.FormValue("type")
	product.Description = r.FormValue("description")

	// Parse price with proper error handling
	priceStr := r.FormValue("price")
	price, err := utils.ParsePrice(priceStr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	product.Price = price

	// Handle file upload
	file, handler, err := r.FormFile("image")
	if err != nil && err != http.ErrMissingFile {
		http.Error(w, "Error retrieving image file: "+err.Error(), http.StatusBadRequest)
		return
	}

	if file != nil {
		defer file.Close()
		imageURL, err := utils.HandleFileUpload(file, handler)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		product.ImageURL = imageURL
	}

	// Call service to create product
	err = c.service.Create(&product)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Add this to your Go handler
	// fmt.Printf("Received file: %+v\n", handler.Filename)
	// Return response
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

// // Helper functions
// func isAllowedFileType(filename string) bool {
// 	ext := strings.ToLower(filepath.Ext(filename))
// 	return ext == ".jpg" || ext == ".jpeg" || ext == ".png"
// }

// func handleFileUpload(file multipart.File, handler *multipart.FileHeader) (string, error) {
// 	// Check file type
// 	if !isAllowedFileType(handler.Filename) {
// 		return "", fmt.Errorf("invalid file type. Only jpg, jpeg, png allowed")
// 	}

// 	// Generate unique filename
// 	filename := fmt.Sprintf("product-%d%s",
// 		time.Now().UnixNano(),
// 		filepath.Ext(handler.Filename))

// 	// Create uploads directory if it doesn't exist
// 	if err := os.MkdirAll("uploads", 0755); err != nil {
// 		return "", fmt.Errorf("error creating upload directory: %v", err)
// 	}

// 	// Create the file
// 	dst, err := os.Create(filepath.Join("uploads", filename))
// 	if err != nil {
// 		return "", fmt.Errorf("error creating file: %v", err)
// 	}
// 	defer dst.Close()

// 	// Copy the uploaded file
// 	if _, err := io.Copy(dst, file); err != nil {
// 		return "", fmt.Errorf("error saving file: %v", err)
// 	}

// 	return "/uploads/" + filename, nil
// }

func (c *ProductController) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	// Log request details
	// log.Printf("Update Request - Method: %s, URL: %s", r.Method, r.URL.Path)
	// log.Printf("Content-Type: %s", r.Header.Get("Content-Type"))

	// // Get id from URL parameter
	// vars := mux.Vars(r)
	// id, err := strconv.Atoi(vars["id"])
	// if err != nil {
	// 	http.Error(w, "Invalid ID", http.StatusBadRequest)
	// 	return
	// }

	// // Log form data
	// log.Printf("Form data: %+v", r.Form)

	// // Parse request body
	// var product models.Product
	// err = json.NewDecoder(r.Body).Decode(&product)
	// if err != nil {
	// 	http.Error(w, "Invalid request body", http.StatusBadRequest)
	// 	return
	// }

	// // Ensure ID in URL matches product ID
	// product.ID = id

	// // Call service to update
	// err = c.service.UpdateProduct(&product)
	// if err != nil {
	// 	switch {
	// 	case err.Error() == "name cannot be empty":
	// 		http.Error(w, err.Error(), http.StatusBadRequest)
	// 	case err.Error() == "type cannot be empty":
	// 		http.Error(w, err.Error(), http.StatusBadRequest)
	// 	case err.Error() == "price must be greater than zero":
	// 		http.Error(w, err.Error(), http.StatusBadRequest)
	// 	case strings.Contains(err.Error(), "not found"):
	// 		http.Error(w, err.Error(), http.StatusNotFound)
	// 	default:
	// 		http.Error(w, "Error updating product", http.StatusInternalServerError)
	// 	}
	// 	return
	// }

	// // Return success response
	// w.Header().Set("Content-Type", "application/json")
	// json.NewEncoder(w).Encode(map[string]string{
	// 	"message": fmt.Sprintf("Product with ID %d successfully updated", id),
	// })
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	// Parse multipart form
	err = r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Error parsing form data: "+err.Error(), http.StatusBadRequest)
		return
	}

	var product models.Product
	product.ID = id

	// Parse form fields
	product.Name = r.FormValue("name")
	product.Type = r.FormValue("type")
	product.Description = r.FormValue("description")

	// Parse price
	priceStr := r.FormValue("price")
	price, err := utils.ParsePrice(priceStr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	product.Price = price

	// Handle file upload if present
	file, handler, err := r.FormFile("image")
	if err != nil && err != http.ErrMissingFile {
		http.Error(w, "Error retrieving image file: "+err.Error(), http.StatusBadRequest)
		return
	}

	if file != nil {
		defer file.Close()
		imageURL, err := utils.HandleFileUpload(file, handler)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		product.ImageURL = imageURL
	} else {
		// Keep existing image URL if no new file is uploaded
		product.ImageURL = r.FormValue("image_url")
	}

	// Call service to update
	err = c.service.UpdateProduct(&product)
	if err != nil {
		switch {
		case err.Error() == "name cannot be empty":
			http.Error(w, err.Error(), http.StatusBadRequest)
		case err.Error() == "type cannot be empty":
			http.Error(w, err.Error(), http.StatusBadRequest)
		case err.Error() == "price must be greater than zero":
			http.Error(w, err.Error(), http.StatusBadRequest)
		case strings.Contains(err.Error(), "not found"):
			http.Error(w, err.Error(), http.StatusNotFound)
		default:
			http.Error(w, "Error updating product", http.StatusInternalServerError)
		}
		return
	}

	// Return success response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": fmt.Sprintf("Product with ID %d successfully updated", id),
	})
}

func (c *ProductController) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	// Get id from URL parameter
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	// Call the service method to delete
	err = c.service.DeleteProduct(id)
	if err != nil {
		// Check if it's a "not found" error
		if err.Error() == "product not found" {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		// For other errors
		http.Error(w, "Error deleting product", http.StatusInternalServerError)
		return
	}

	// Return success response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": fmt.Sprintf("Product with ID %d successfully deleted", id),
	})
}

func (c *ProductController) SearchProducts(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name")
	if name == "" {
		http.Error(w, "Search term required", http.StatusBadRequest)
		return
	}

	products, err := c.service.SearchProducts(name)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func (c *ProductController) GetPagedProducts(w http.ResponseWriter, r *http.Request) {
	params := models.FilterParams{
		Page:      1,
		PageSize:  5,
		MinPrice:  0,
		MaxPrice:  0,
		Type:      "",
		SortBy:    "",
		SortOrder: "asc",
	}

	// Parse query parameters
	if page := r.URL.Query().Get("page"); page != "" {
		if pageNum, err := strconv.Atoi(page); err == nil {
			params.Page = pageNum
		}
	}

	if pageSize := r.URL.Query().Get("pageSize"); pageSize != "" {
		if size, err := strconv.Atoi(pageSize); err == nil {
			params.PageSize = size
		}
	}

	if minPrice := r.URL.Query().Get("minPrice"); minPrice != "" {
		if price, err := strconv.ParseFloat(minPrice, 64); err == nil {
			params.MinPrice = price
		}
	}

	if maxPrice := r.URL.Query().Get("maxPrice"); maxPrice != "" {
		if price, err := strconv.ParseFloat(maxPrice, 64); err == nil {
			params.MaxPrice = price
		}
	}

	params.Type = r.URL.Query().Get("type")
	params.SortBy = r.URL.Query().Get("sortBy")
	params.SortOrder = r.URL.Query().Get("sortOrder")

	response, err := c.service.GetPagedProducts(params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
