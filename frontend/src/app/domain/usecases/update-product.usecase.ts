import { Inject, Injectable } from "@angular/core";
import { Observable, throwError, tap, catchError } from "rxjs";
import { ProductValidator } from "src/app/core/validators/validation-result";
import { Product } from "src/app/models/product.model";
import { ProductRepository } from "../repository/product.repository";
import { NGXLogger } from "ngx-logger";
import { ProductMapper } from "src/app/mappers/product.mapper";

@Injectable({
    providedIn: 'root'
})
export class UpdateProductUseCase {
    constructor(
        @Inject('ProductRepository') private productRepository: ProductRepository,
        private logger: NGXLogger,
        private validator: ProductValidator,
    ) { }

    execute(id: number, product: Product): Observable<Product> {
        console.log('UseCase updating product:', id, product); // Debug log

        const validationResult = this.validator.validateProduct(product);
        if (!validationResult.isValid) {
            return throwError(() => new Error(validationResult.errors.join(', ')));
        }

        return this.productRepository.update(id, product).pipe(
            tap(updatedProduct => {
                this.logger.info('Product updated successfully:', updatedProduct);
            }),
            catchError(error => {
                this.logger.error('Failed to update product', error);
                return throwError(() => new Error('Failed to update product'));
            })
        );
    }
}
