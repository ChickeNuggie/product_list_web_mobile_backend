import { Inject, Injectable } from "@angular/core";
import { Observable, throwError, tap, catchError } from "rxjs";
import { ProductValidator } from "src/app/core/validators/validation-result";
import { Product } from "src/app/models/product.model";
import { ProductRepository } from "../repository/product.repository";
import { NGXLogger } from "ngx-logger";

@Injectable({
    providedIn: 'root'
})
export class CreateProductUseCase {
    constructor(
        @Inject('ProductRepository') private productRepository: ProductRepository,
        private validator: ProductValidator,
        private logger: NGXLogger
    ) { }

    execute(product: Product): Observable<Product> {
        // Validate product
        const validationResult = this.validator.validateProduct(product);
        if (!validationResult.isValid) {
            return throwError(() => new Error(validationResult.errors.join(', ')));
        }

        // Apply business rules
        const enrichedProduct = this.enrichProduct(product);

        // Save to repository
        return this.productRepository.create(enrichedProduct).pipe(
            tap(newProduct => this.logger.log(`Created product with ID ${newProduct.id}`)),
            catchError(error => {
                this.logger.error('Failed to create product', error);
                return throwError(() => new Error('Failed to create product'));
            })
        );
    }

    private enrichProduct(product: Product): Product {
        // Use the static method from Product class
        return Product.createWithBusinessRules(product);
    }
}