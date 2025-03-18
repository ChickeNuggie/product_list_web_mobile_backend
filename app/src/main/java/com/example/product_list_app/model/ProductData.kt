package com.example.product_list_app.model

import com.google.gson.annotations.SerializedName
import java.io.File
import java.io.Serializable
import java.util.Date

data class ProductData(
    val id: Int,
    val name: String,
    val type: String,
    val price: Double,
    val description: String,

    @SerializedName("image_url")
    val imageUrl: String? = null, // for existing file (nullable)
    val image: File? = null,      // for file upload (nullable)

    @SerializedName("created_at")
    val createdAt: String,          // make sure to initalize this when creating the object
    val status: String? = null    // nullable
)