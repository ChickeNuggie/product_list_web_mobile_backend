import { Observable } from "rxjs";
import { ProductRepository } from "../repository/product.repository";
import { Product } from "src/app/models/product.model";
import { Injectable } from "@angular/core";
import { ProductRepositoryImpl } from "../repository/product.repository.impl";

@Injectable({
    providedIn: 'root'
})

export class SearchProductsUseCase {
    constructor(private productRepository: ProductRepositoryImpl) { }

    execute(name: string): Observable<Product[]> {
        return this.productRepository.searchByName(name);
    }
}
