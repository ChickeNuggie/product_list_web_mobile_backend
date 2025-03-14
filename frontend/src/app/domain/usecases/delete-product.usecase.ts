import { Inject, Injectable } from "@angular/core";
import { Observable, tap, catchError, throwError } from "rxjs";
import { ProductValidator } from "src/app/core/validators/validation-result";
import { ProductRepository } from "../repository/product.repository";
import { NGXLogger } from "ngx-logger";


@Injectable({
    providedIn: 'root'
})
export class DeleteProductUseCase {
    constructor(
        @Inject('ProductRepository') private productRepository: ProductRepository,
        private logger: NGXLogger,
        private validator: ProductValidator,
    ) { }

    execute(id: number): Observable<void> {
        return this.productRepository.delete(id).pipe(
            tap(() => {
                this.logger.info(`Product deleted successfully: ${id}`);
            }),
            catchError(error => {
                this.logger.error('Failed to delete product', error);
                return throwError(() => new Error('Failed to delete product'));
            })
        );
    }
}
