import { Observable, catchError, throwError } from "rxjs";
import { Product } from "src/app/models/product.model";
import { ProductRepository } from "../repository/product.repository";
import { Inject, Injectable } from "@angular/core";
import { NGXLogger } from 'ngx-logger';


@Injectable({
    providedIn: 'root'
})
export class GetProductUseCase {
    constructor(
        @Inject('ProductRepository') private productRepository: ProductRepository,
        private logger: NGXLogger
    ) { }

    execute(id: number): Observable<Product> {
        this.logger.log(`Fetching product with ID: ${id}`);

        return this.productRepository.getById(id).pipe(
            catchError(error => {
                this.logger.error(`Error fetching product with ID ${id}:`, error);
                return throwError(() => new Error('Failed to fetch product'));
            })
        );
    }
}
