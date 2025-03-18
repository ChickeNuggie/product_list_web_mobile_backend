package com.example.product_list_app.view

import android.annotation.SuppressLint
import androidx.compose.runtime.Composable
import androidx.navigation.NavHost
import androidx.navigation.NavType
import androidx.navigation.compose.rememberNavController
import com.example.product_list_app.viewmodel.ProductViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument

@SuppressLint("StateFlowValueCalledInComposition")
@Composable
fun ProductNavigation(viewModel: ProductViewModel) {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "productList") {
        composable("productList") {
            ProductListScreen(
                viewModel = viewModel,
                onProductClick = {
                    productId ->
                    navController.navigate("productDetail/$productId")
                },
                onAddProductClick = {
                    navController.navigate("productEdit/new")
                }
            )
        }

        composable(
            route = "productDetail/{productId}",
            arguments = listOf(
                navArgument("productId") { type = NavType.IntType }
            )
        ) { backStackEntry ->
            val productId = backStackEntry.arguments?.getInt("productId") ?: return@composable

            ProductDetailScreen(
                productId = productId,
                viewModel = viewModel,
                onNavigateBack = {
                    navController.popBackStack()
                },
                onEditProduct = { product ->
                    navController.navigate("productEdit/${product.id}")
                }
            )
        }

        composable(
            route = "productEdit/{productId}",
            arguments = listOf(
                navArgument("productId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val productParam = backStackEntry.arguments?.getString("productId") ?: return@composable

            // If productId is "new", we're adding a new product
            val product = if (productParam == "new") {
                null
            } else {
                // Getting product from selected product in viewModel
                viewModel.selectedProduct.value
            }

            ProductEditScreen(
                product = product,
                viewModel = viewModel,
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}