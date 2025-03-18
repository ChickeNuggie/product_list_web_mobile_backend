package com.example.product_list_app.services

import com.example.product_list_app.model.ProductData
import com.example.product_list_app.model.ProductList
import com.example.product_list_app.repository.ProductDataRepositoryImpl

class ProductService(private val repo: ProductDataRepositoryImpl ) {
    suspend fun getProducts(page: Int, limit: Int): Result<ProductList> {
        return repo.getProducts(page, limit)
    }

    suspend fun getProductById(id: Int): Result<ProductData> {
        return repo.getProductById(id)
    }

    suspend fun searchProducts(query: String): Result<List<ProductData>> {
        return repo.searchProducts(query)
    }

    suspend fun createProduct(product: ProductData): Result<ProductData> {
        return repo.createProduct(product)
    }

    suspend fun updateProduct(id: Int, product: ProductData): Result<ProductData> {
        return repo.updateProduct(id, product)
    }

    suspend fun deleteProduct(id: Int): Result<Void> {
        return repo.deleteProduct(id)
    }
}