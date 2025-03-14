package main

import (
	"PRODUCT_LIST/controllers"
	"PRODUCT_LIST/domain/repositories"
	"PRODUCT_LIST/services"
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

func main() {
	db, err := sql.Open("postgres", "postgres://postgres:password@localhost:5432/postgres?sslmode=disable")
	if err != nil {
		log.Fatal("Error opening database:", err)
	}
	defer db.Close()

	// Test connection
	err = db.Ping()
	if err != nil {
		log.Fatal("Error connecting to the database:", err)
	}

	// Verify table exists
	var exists bool
	err = db.QueryRow(`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'products'
        );
    `).Scan(&exists)
	if err != nil {
		log.Fatal("Error checking table existence:", err)
	}
	if !exists {
		log.Fatal("Products table does not exist in the database")
	}

	// Initialize repository, service, and controller
	productRepo := repositories.NewProductRepository(db)
	productService := services.NewProductService(productRepo)
	productController := controllers.NewProductController(productService)

	// Router setup
	router := mux.NewRouter()

	// Create an uploads directory if it doesn't exist
	if err := os.MkdirAll("uploads", 0755); err != nil {
		log.Fatal("Error creating uploads directory:", err)
	}

	// Routes
	router.HandleFunc("/api/products/search", productController.SearchProducts).Methods("GET")
	// router.HandleFunc("/api/products", productController.GetProducts).Methods("GET")
	router.HandleFunc("/api/products", productController.GetPagedProducts).Methods("GET")

	router.HandleFunc("/api/products/{id}", productController.GetProduct).Methods("GET")
	router.HandleFunc("/api/products", productController.CreateProduct).Methods("POST")
	router.HandleFunc("/api/products/{id}", productController.UpdateProduct).Methods("PUT")
	router.HandleFunc("/api/products/{id}", productController.DeleteProduct).Methods("DELETE")

	// Add other routes...

	// CORS
	c := cors.New(cors.Options{
		//The proxy will forward requests from 4200 to 8080 transparently
		AllowedOrigins:   []string{"http://localhost:4200"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}, // Added OPTIONS
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		ExposedHeaders:   []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	// Create handler chain
	handler := c.Handler(router)

	// Serve static files from uploads directory
	router.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("uploads"))))

	// Start server
	log.Printf("Server starting on :8080")
	//backend's port
	log.Fatal(http.ListenAndServe(":8080", handler))
}
