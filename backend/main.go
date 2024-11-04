package main

import (
	"PRODUCT_LIST/controllers"
	"PRODUCT_LIST/domain/repositories"
	"PRODUCT_LIST/services"
	"database/sql"
	"log"
	"net/http"

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

	// Routes
	router.HandleFunc("/api/products", productController.GetProducts).Methods("GET")
	router.HandleFunc("/api/products", productController.CreateProduct).Methods("POST")
	// Add other routes...

	// CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"Content-Type", "Authorization"},
	})

	log.Fatal(http.ListenAndServe(":8080", c.Handler(router)))
}
