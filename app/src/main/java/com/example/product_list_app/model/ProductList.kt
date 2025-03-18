package com.example.product_list_app.model

data class ProductList (
    var products: List<ProductData> = emptyList(),
    val page: Int = 1,
    val pageSize: Int = 10,
    val totalItems: Int = 0,
    val totalPages: Int = 0
)