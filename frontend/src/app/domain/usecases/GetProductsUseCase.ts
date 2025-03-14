import { Inject, Injectable } from "@angular/core";
import { ProductRepository } from "../repository/product.repository";
import { NGXLogger } from "ngx-logger";
import { catchError, map, Observable, tap, throwError } from "rxjs";
import { Product } from "src/app/models/product.model";
import { ProductValidator } from "src/app/core/validators/validation-result";
import { FilterParams } from "src/app/shared/interfaces/filter-params";
import { PaginatedResponse } from "src/app/core/core/interfaces/paginated-response";

// Interactors : implement logic separtely from repositories (logic with data access),
// used across multiple places (ProductDashboardViewModel, etc),
// error handling, testability by mocking object without creating.
@Injectable({
    providedIn: 'root'
})
export class GetProductsUseCase {
    constructor(
        @Inject('ProductRepository') private productRepository: ProductRepository,
        private logger: NGXLogger,
        private validator: ProductValidator,
    ) { }


    // execute(page: number, pageSize: number): Observable<Product[]> {
    //     console.log('Execute called with:', { page, pageSize });

    //     // Validate input
    //     try {
    //         this.validator.validatePagination(page, pageSize);
    //         console.log('Pagination validation passed');
    //     } catch (error) {
    //         console.error('Pagination validation failed:', error);
    //         throw error;
    //     }

    //     // Business logic
    //     return this.productRepository.getAll(page, pageSize).pipe(
    //         tap(products => {
    //             console.log('Raw products from repository:', products);
    //             this.logger.log(`Fetched ${products.length} products`);
    //         }),
    //         map(products => {
    //             console.log('Sorting products by price');
    //             const sortedProducts = this.sortByPrice(products);
    //             console.log('Sorted products:', sortedProducts);
    //             return sortedProducts;
    //         }),
    //         catchError(error => {
    //             console.error('Error in execute:', error);
    //             this.logger.error('Failed to fetch products', error);
    //             return throwError(() => new Error('Failed to load products'));
    //         })
    //     );
    // }

    execute(params: FilterParams): Observable<PaginatedResponse<Product>> {
        return this.productRepository.getProducts(params);
    }

    private sortByPrice(products: Product[]): Product[] {
        return [...products].sort((a, b) => a.price - b.price);
    }
}
