import { Injectable } from "@angular/core";
import { ProductRepository } from "../repository/product.repository";
import { NGXLogger } from "ngx-logger";
import { Observable } from "rxjs";
import { Product } from "../entities/product.entity";
import { ProductFilter } from "../entities/product.filter.entity";

@Injectable()
export class GetProductsUseCase {
    constructor(
        private productRepository: ProductRepository,
        private logger: NGXLogger
    ) { }

    execute(product: ProductFilter): Observable<Product[]> {
        this.logger.log('Executing GetProductsUseCase');
        return this.productRepository.getAll(product);
    }
}