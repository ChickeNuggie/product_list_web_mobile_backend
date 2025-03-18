package com.example.product_list_app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.product_list_app.model.ProductData
import com.example.product_list_app.repository.ProductDataRepositoryImpl
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

//Manages all app state and business logic, communicating with your repository to:
//1. Load and paginate products
//2. Search products
//3. Create, update, and delete products
//4. Track UI state (loading, success, error)

sealed class ProductUiState {
    //Doesn't store any data, on instance, can check loading directly in when expression
    // act as a marker to indicate app is currently fetching data.
    object Loading : ProductUiState() // subclass of productUIstate, allow to be used when handling different UI state.
    data class Success(val products: List<ProductData>, val isLoading: Boolean = false) : ProductUiState()
    data class Error(val message: String) : ProductUiState()
}

class ProductViewModel(private val productService: ProductDataRepositoryImpl) : ViewModel() {
    // reactive UI state for product screen for jetpack compose. (for coroutines)
    // auto re-compose when stateflow value changes, better state management
    // with this, u need to observeAsState which is less efficient, unless work with xml-based (fragments/activities) or legacy code UI.

    // UI state
    private val _uiState = MutableStateFlow<ProductUiState>(ProductUiState.Loading)
    val uiState: StateFlow<ProductUiState> = _uiState.asStateFlow()

    // Current page and pagination info
    private var currentPage = 1
    private val pageSize = 10
    private var hasMoreItems =
        true //when first loads, it is set to true as there's chance to load more products.

    // Search query
    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()

    // Selected product
    private val _selectedProduct = MutableStateFlow<ProductData?>(null)
    val selectedProduct = _selectedProduct.asStateFlow()

    private val _selectedImageUri = MutableStateFlow<String?>(null)
    val selectedImageUri = _selectedImageUri.asStateFlow()

    init {
        loadProducts()
    }

    // loads and update UI state
    fun loadProducts() {
        //viewmodel scope to fetch data from api calls and update ui state (background thread async, ensure coroutine cancel when viewmodel is cleared.)
        viewModelScope.launch {
            // updates the loading state of the ui so the ui knows that data fetching has started/in progress
            // set uiState to loading to notify UI that is waiting for data.
            _uiState.value = ProductUiState.Loading

            try {
                // fetch products data from backend based on current page and page size
                val result = productService.getProducts(currentPage, pageSize)
                // fold handles success and failures
                result.fold(
                    //if api call successful, this block run the received productlist.
                    onSuccess = { productList ->
                        hasMoreItems = productList.products.size >= pageSize
                        // retrieves current UI state to decide how to update the UI
                        // while data is loading, UI can check for loading and display progress indicator.
                        _uiState.value = when (val currentState = _uiState.value) {
                            is ProductUiState.Success -> {
                                // If user is paginating (loading more products), take existing product list, add new products to it and create new UI state with updated list.
                                // subsequent page loads, keep previous products and adds new products to list only when user scrolls without losing existing data.
                                if (currentPage > 1) {
                                    currentState.copy(
                                        products = currentState.products + productList.products,
                                        isLoading = false
                                    )
                                } else {
                                    // First page load, if first page, replace product list instead of appending.
                                    // useful when loading data first time or after refreshing.
                                    ProductUiState.Success(
                                        products = productList.products,
                                        isLoading = false
                                    )
                                }
                            }

                            else -> ProductUiState.Success(
                                products = productList.products,
                                isLoading = false
                            )
                        }
                    },
                    onFailure = { error ->
                        _uiState.value =
                            ProductUiState.Error(error.message ?: "Unknown error occurred")
                    }
                )
            } catch (e: Exception) {
                _uiState.value = ProductUiState.Error(e.message ?: "Unknown error occurred")
            }
        }
    }

    fun loadMoreProducts() {
        // more items available when user scroll and current UI state is not already loading (avoid multiple loading requests, so fetch changes all at once)
        // "is" check the type if object is an instance of a specific class/subclass.
        // ensures new products are only loaded when there's more data and its not already loading.
        if (hasMoreItems && _uiState.value !is ProductUiState.Loading) {
            currentPage++ // increase the page to next page.

            // Show loading indicator while keeping existing data
            // if current ui state is success = already products loaded, updates UI state by setting isLoading = true, showing more products are being loaded.
            if (_uiState.value is ProductUiState.Success) {
                _uiState.value = (_uiState.value as ProductUiState.Success).copy(isLoading = true)
            }
            // fetch next batch of products from API
            loadProducts()
        }
    }

    fun refreshProducts() {
        currentPage = 1
        loadProducts()
    }

    fun searchProducts(query: String) {
        _searchQuery.value = query

        // If the query is empty, return to normal product list
        if (query.isBlank()) {
            refreshProducts()
            return
        }

        viewModelScope.launch {
            _uiState.value = ProductUiState.Loading

            try {
                val result = productService.searchProducts(query)
                result.fold(
                    onSuccess = { products ->
                        _uiState.value = ProductUiState.Success(products, false)
                    },
                    onFailure = { error ->
                        _uiState.value = ProductUiState.Error(error.message ?: "Search failed")
                    }
                )
            } catch (e: Exception) {
                _uiState.value = ProductUiState.Error(e.message ?: "Search failed")
            }
        }
    }

    fun getProductDetails(id: Int) {
        viewModelScope.launch {
            try {
                val result = productService.getProductById(id)
                result.fold(
                    onSuccess = { product ->
                        _selectedProduct.value = product
                    },
                    onFailure = { error ->
                        _uiState.value =
                            ProductUiState.Error(error.message ?: "Unable to get product id")
                    }
                )
            } catch (e: Exception) {
                _uiState.value = ProductUiState.Error(e.message ?: "An unexpected error occurred")
            }
        }
    }

    fun createProduct(product: ProductData) {
        viewModelScope.launch {
            try {
                val result = productService.createProduct(product)
                result.fold(
                    onSuccess = {
                        refreshProducts()
                    },
                    onFailure = { error ->
                        _uiState.value =
                            ProductUiState.Error(error.message ?: "Failed to create product")
                    }
                )
            } catch (e: Exception) {
                _uiState.value = ProductUiState.Error(e.message ?: "Failed to create product")
            }
        }
    }

    fun updateProduct(id: Int, product: ProductData) {
        viewModelScope.launch {
            try {
                val result = productService.updateProduct(id, product)
                result.fold(
                    onSuccess = {
                        refreshProducts()
                    },
                    onFailure = { error ->
                        _uiState.value =
                            ProductUiState.Error(error.message ?: "Failed to update product")
                    }
                )
            } catch (e: Exception) {
                _uiState.value = ProductUiState.Error(e.message ?: "Failed to update product")
            }
        }
    }

    fun deleteProduct(id: Int) {
        viewModelScope.launch {
            try {
                val result = productService.deleteProduct(id)
                result.fold(
                    onSuccess = {
                        refreshProducts()
                    },
                    onFailure = { error ->
                        _uiState.value =
                            ProductUiState.Error(error.message ?: "Failed to delete product")
                    }
                )
            } catch (e: Exception) {
                _uiState.value = ProductUiState.Error(e.message ?: "Failed to delete product")
            }
        }
    }

    fun setSelectedImageUri(uri: String?) {
        _selectedImageUri.value = uri
    }

    fun clearSelectedProduct() {
        _selectedProduct.value = null
    }

    fun loadProductImage(imagePath: String?) {
        _selectedImageUri.value = productService.getFullImageUrl(imagePath)
    }
}
