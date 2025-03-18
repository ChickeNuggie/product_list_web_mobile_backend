package com.example.product_list_app.model.apiService

import com.example.product_list_app.model.ProductData
import com.example.product_list_app.model.ProductList
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface ProductApiService {
    @GET("api/products")
    suspend fun getProducts(@Query("page") page: Int? = null,
                             @Query("pageSize") pageSize: Int? = null,
                             @Query("minPrice") minPrice: Double? = null,
                             @Query("maxPrice") maxPrice: Double? = null,
                             @Query("type") type: String? = null,
                             @Query("sortBy") sortBy: String? = null,
                             @Query("sortOrder") sortOrder: String? = "asc"): Response<ProductList>

    @GET("api/products/{id}")
    suspend fun getProductById(@Path("id") id: Int): Response<ProductData>

    @GET("api/products/search")
    suspend fun searchProducts(@Query("name") query: String): Response<List<ProductData>>

    @POST("api/products")
    suspend fun createProduct(@Body productData: ProductData): Response<ProductData>

    @PUT("api/products/{id}")
    suspend fun updateProduct(@Path("id") id: Int, @Body product: ProductData): Response<ProductData>

    @DELETE("api/products/{id}")
    suspend fun deleteProduct(@Path("id") id: Int): Response<Void>
}