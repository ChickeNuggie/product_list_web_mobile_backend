package com.example.product_list_app.repository

import com.example.product_list_app.interfaces.ProductDataRepository
import com.example.product_list_app.model.ProductData
import com.example.product_list_app.model.ProductList
import com.example.product_list_app.model.apiService.ProductApiService
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class ProductDataRepositoryImpl() : ProductDataRepository{
    // Android emulator - 10.0.2.2, 8080 - backend server port (in order to send api request)
    private val baseUrl = "http://10.0.2.2:8080/"  // Points to localhost from Android emulator

    //sets up Retrofit to handle API calls to your backend, using OkHttpClient for HTTP connections and Gson for JSON parsing.
    //It configures a connection to the backend running on your local machine through the Android emulator
    private val retrofit: Retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(baseUrl)
            .addConverterFactory(GsonConverterFactory.create()) //convert JSON response into Kotlin object.
            .client(createOkHttpClient()) //handle http connection
            .build() //build settings above.
    }

    //contains api methods that correspond to the actual API endpoints of your backend.
    //lazy = ensure apiService only created when it's first needed, optimize performance.
    private val apiService: ProductApiService by lazy {
        retrofit.create(ProductApiService::class.java) //auto generate implementation of this interface based on HTTP annotations (@GET. @POST)
    }

    // handle actual http connection
    //ensures that the app won't hang indefinitely when making an API call, if send/receive data too long, it will cancel request to prevent memory leak or hang.
    private fun createOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS) //time for client to wait to establish connection
            .readTimeout(30, TimeUnit.SECONDS) // time for client to wait to read data
            .writeTimeout(30, TimeUnit.SECONDS) // time for client to wait to write data
            .build()
    }

    override suspend fun getProducts(page: Int, pageSize: Int): Result<ProductList> {
        return try {
            val response = apiService.getProducts(page = page, pageSize = pageSize)
            if (response.isSuccessful) {
                val productList = response.body()
                if (productList != null) {
                    // Ensure products list is never null, use empty list if needed
                    if (productList.products == null) {
                        // Create a copy with empty list instead of null
                        val fixedProductList = productList.copy(products = emptyList())
                        Result.success(fixedProductList)
                    } else {
                        Result.success(productList)
                    }
                } else {
                    Result.failure(Exception("Empty response body"))
                }
            } else {
                Result.failure(Exception("Failed to fetch products: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getProductById(id: Int): Result<ProductData> {
        return try {
            val response = apiService.getProductById(id)
            if(response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error fetching product by ID: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
            }
        }

    override suspend fun searchProducts(query: String): Result<List<ProductData>> {
        return try {
            val response = apiService.searchProducts(query)
            if(response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error searching products: ${response.code()}"))
            }
    } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun createProduct(product: ProductData): Result<ProductData> {
        return try {
            val response = apiService.createProduct(product)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error creating product: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun updateProduct(id: Int, product: ProductData): Result<ProductData> {
        return try {
            val response = apiService.updateProduct(id, product)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error updating product: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun deleteProduct(id: Int): Result<Void> {
        return try {
            val response = apiService.deleteProduct(id)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Error deleting product: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // handling the image loading
    override fun getFullImageUrl(imagePath: String?): String {
        val baseUrl = "http://10.0.2.2:8080" // Same base URL from repository

        if (imagePath.isNullOrBlank()) {
            return "" // Return empty string for null or blank paths
        }

        // If the path already starts with http, return it as is
        if (imagePath.startsWith("http")) {
            return imagePath
        }

        // Make sure the path starts with a slash
        val normalizedPath = if (!imagePath.startsWith("/")) "/$imagePath" else imagePath

        // Combine base URL with path
        return baseUrl + normalizedPath
    }
}