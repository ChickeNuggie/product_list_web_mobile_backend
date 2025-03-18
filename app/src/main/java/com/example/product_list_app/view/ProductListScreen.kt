package com.example.product_list_app.view

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.snapshotFlow
import com.example.product_list_app.viewmodel.ProductViewModel
import com.example.product_list_app.viewmodel.ProductUiState
import org.w3c.dom.Text
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.Button
import androidx.compose.material.Card
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.material3.Text
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.material.CircularProgressIndicator
import androidx.compose.material.Divider
import androidx.compose.material.ExperimentalMaterialApi
import androidx.compose.material.FloatingActionButton
import androidx.compose.material.MaterialTheme
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Image
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import com.example.product_list_app.model.ProductData
import kotlinx.coroutines.launch


//Main screen that displays products in a LazyColumn with:
//1. Search functionality
//2. Infinite scrolling pagination
//3. Pull-to-refresh
//4. Add product button
//5. Error handling

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterialApi::class)
@Composable
fun ProductListScreen(
    viewModel: ProductViewModel,
    onProductClick: (Int) -> Unit,
    onAddProductClick: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val listState =
        rememberLazyListState() //manage state of a list displayed lazily to keep track of scroll position, control or observe scroll behaviour.
    val coroutineScope =
        rememberCoroutineScope() //ensure any background tasks launched inside this scope will be properly cleaned up when compose no longer displayed.
    //If you're using a LazyColumn and want to fetch data in the background or trigger a scroll action when a button is clicked, you'd use rememberCoroutineScope() to safely launch those background tasks.
    // tied to UI's lifecycle, ensure canceled when UI element no longer visible.

    // Check if we're near the end of the list to trigger pagination
    //It launch side effect when state of list changes.
    LaunchedEffect(listState) {
        //This creates a flow that observes the current visible items in the list (like which rows are currently on the screen).
        snapshotFlow { listState.layoutInfo.visibleItemsInfo }
            .collect { visibleItems -> // collect visible items whenever visible items changes
                val lastVisibleItemIndex = visibleItems.lastOrNull()?.index
                    ?: 0 // find index of last visible items on screen
                val totalItemsCount =
                    listState.layoutInfo.totalItemsCount //total number of items in list.

                // Load more when we're 2 items away from the end
                if (totalItemsCount - lastVisibleItemIndex <= 2 && totalItemsCount > 0) {
                    viewModel.loadMoreProducts()
                }
            }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        // Top App Bar with Search
        TopAppBar(
            title = { Text("Products") },
            actions = {
                // Search field
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { viewModel.searchProducts(it) },
                    modifier = Modifier
                        .fillMaxWidth(0.7f)
                        .padding(end = 8.dp),
                    placeholder = { Text("Search products") },
                    singleLine = true,
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search") },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { viewModel.searchProducts("") }) {
                                Icon(Icons.Default.Clear, contentDescription = "Clear")
                            }
                        }
                    }
                )
            }
        )

        Box(modifier = Modifier.fillMaxSize()) {
            when (uiState) {
                is ProductUiState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }

                is ProductUiState.Success -> {
                    val products = (uiState as ProductUiState.Success).products
                    val isLoading = (uiState as ProductUiState.Success).isLoading

                    if (products.isEmpty()) {
                        Text(
                            text = "No products found",
                            modifier = Modifier
                                .align(Alignment.Center)
                                .padding(16.dp)
                        )
                    } else {
                        LazyColumn(
                            state = listState,
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(bottom = 80.dp)
                        ) {
                            items(products) { product ->
                                ProductItem(
                                    product = product,
                                    viewModel = viewModel) {
                                    onProductClick(product.id)
                                }

                                Divider()
                            }

                            // Show bottom loader if loading more
                            if (isLoading) {
                                item {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(16.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        CircularProgressIndicator(modifier = Modifier.size(24.dp))
                                    }
                                }
                            }
                        }
                    }
                }

                is ProductUiState.Error -> {
                    Column(
                        modifier = Modifier
                            .align(Alignment.Center)
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Error: ${(uiState as ProductUiState.Error).message}")
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { viewModel.refreshProducts() }) {
                            Text("Retry")
                        }
                    }
                }
            }

            // Floating action button for adding products
            FloatingActionButton(
                onClick = onAddProductClick,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(16.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Product")
            }

            // Pull to refresh
            if (uiState is ProductUiState.Success) {
                PullRefreshIndicator(
                    refreshing = (uiState as ProductUiState.Success).isLoading,
                    state = rememberPullRefreshState(
                        refreshing = (uiState as ProductUiState.Success).isLoading,
                        onRefresh = {
                            coroutineScope.launch {
                                listState.scrollToItem(0)
                                viewModel.refreshProducts()
                            }
                        }
                    ),
                    modifier = Modifier.align(Alignment.TopCenter)
                )
            }
        }
    }
}
    @Composable
    fun ProductItem(product: ProductData,    viewModel: ProductViewModel,
                    onClick: () -> Unit) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
                .clickable(onClick = onClick),
            elevation = 2.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // Image section
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .align(Alignment.CenterVertically)
                ) {
                    if (!product.imageUrl.isNullOrEmpty()) {
                        // Load image using Coil or other image loading library
                        val fullImageUrl = viewModel.loadProductImage(product.imageUrl)
                        AsyncImage(
                            model = fullImageUrl,
                            contentDescription = "Product image",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        // Placeholder when no image is available
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(MaterialTheme.colors.surface),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Image,
                                contentDescription = "No image",
                                tint = MaterialTheme.colors.onSurface
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.width(16.dp))

                // Text content
                Column(
                    modifier = Modifier
                        .weight(1f)
                ) {
                    Text(
                        text = product.name,
                        style = MaterialTheme.typography.h3
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Price: $${product.price}",
                        style = MaterialTheme.typography.body1
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = product.description,
                        style = MaterialTheme.typography.body2,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
    }

@Composable
fun rememberPullRefreshState(
    refreshing: Boolean,
    onRefresh: () -> Unit
): PullRefreshState {
    return remember(refreshing) {
        object : PullRefreshState {
            override val refreshing: Boolean
                get() = refreshing

            override fun startRefresh() {
                onRefresh()
            }
        }
    }
}

interface PullRefreshState {
    val refreshing: Boolean
    fun startRefresh()
}

@Composable
fun PullRefreshIndicator(
    refreshing: Boolean,
    state: PullRefreshState,
    modifier: Modifier = Modifier
) {
    if (refreshing) {
        Box(modifier = modifier.padding(16.dp)) {
            CircularProgressIndicator(
                modifier = Modifier
                    .size(36.dp)
                    .align(Alignment.Center)
            )
        }
    }
}
