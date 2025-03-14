// Transform raw data from backend (entities) to data used in application (models)

import { Injectable } from "@angular/core";
import { ProductEntity } from "../domain/entities/product.entity";
import { Product } from "../models/product.model";
// Checkpoint before ai replacement

// Avoid messing with the raw data upon retrieveing from database.
@Injectable({
    providedIn: 'root'  // This registers it as a singleton service
})
export class ProductMapper {
    toEntity(model: Product): ProductEntity {
        return {
            id: model.id,
            name: model.name,
            type: model.type,
            price: model.price,
            description: model.description,
            image_url: model.image_url,
            image: model.image,
            created_at: model.created_at,
            status: model.status
        };
    }

    fromEntity(entity: ProductEntity): Product {
        return new Product({
            id: entity.id,
            name: entity.name,
            type: entity.type,
            price: entity.price,
            description: entity.description,
            image_url: entity.image_url,
            image: entity.image,
            created_at: entity.created_at,
            status: entity.status
        });
    }

    // New method for handling form submission
    toProductMapFormData(product: Product): FormData {
        const formData = new FormData();
        Object.entries(product).forEach(([key, value]) => {
            // Skip null/undefined values 
            if (value === null || value === undefined) return;

            switch (key) {
                case 'image':
                    if (value instanceof File) {
                        formData.append('image', value, value.name);
                        console.log('Appending image file:', value.name);
                    }
                    break;

                case 'price':
                    const cleanPrice = parseFloat(value.toString()).toFixed(2);
                    formData.append('price', cleanPrice);
                    break;

                case 'image_url':
                    // Only append image_url if there's no new image file
                    if (value && !product.image) {
                        formData.append('image_url', value);
                        console.log('Keeping existing image_url:', value);
                    }
                    break;

                default:
                    formData.append(key, value.toString());
                    break;
            }
        });

        // Debug the form data
        formData.forEach((value, key) => {
            console.log(`Form data entry - ${key}:`, value);
        });

        return formData;
    }
}