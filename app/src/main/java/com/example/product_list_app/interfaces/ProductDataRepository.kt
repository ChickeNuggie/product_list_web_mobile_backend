package com.example.product_list_app.interfaces

import com.example.product_list_app.model.ProductData
import com.example.product_list_app.model.ProductList

interface ProductDataRepository {
    suspend fun getProducts(page: Int, limit: Int): Result<ProductList>
    suspend fun getProductById(id: Int): Result<ProductData>
    suspend fun searchProducts(query: String): Result<List<ProductData>>
    suspend fun createProduct(product: ProductData): Result<ProductData>
    suspend fun updateProduct(id: Int, product: ProductData): Result<ProductData>
    suspend fun deleteProduct(id: Int): Result<Void>
    fun getFullImageUrl(imagePath: String?): String
}