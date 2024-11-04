// Transform raw data from backend (entities) to data used in application (models)

import { ProductEntity } from "../domain/entities/product.entity";
import { Product } from "../models/product.model";

// Avoid messing with the raw data upon retrieveing from database.
export class ProductMapper {
    toEntity(model: Product): ProductEntity {
        return {
            id: model.id,
            name: model.name,
            type: model.type,
            price: model.price,
            description: model.description,
            imageUrl: model.imageUrl
        };
    }

    fromEntity(entity: ProductEntity): Product {
        return new Product({
            id: entity.id,
            name: entity.name,
            type: entity.type,
            price: entity.price,
            description: entity.description,
            imageUrl: entity.imageUrl
        })
    }
}
