import { HttpClient } from "@angular/common/http";
import { ProductRepository } from "./product.repository";
import { map, Observable } from "rxjs";
import { Product } from "src/app/models/product.model";
import { ProductEntity } from "../entities/product.entity";
import { ProductMapper } from "src/app/mappers/product.mapper";

// Implements the interface of repository.
// Manages the data access to the product list so that
// the view model wont have to worry about details of fetching or updatomg product data.
// Primarily For data access to directly make http request and map data before displaying to the service to do business logic and then to the view.
export class ProductRepositoryImpl implements ProductRepository {
    private apiUrl = 'http://localhost:4200/api/products';

    constructor(
        private http: HttpClient,
        private mapper: ProductMapper
    ) { }

    // get all product based on page size.
    getAll(page: number = 1, pageSize: number = 10): Observable<Product[]> {
        return this.http.get<ProductEntity[]>(`${this.apiUrl}?page=${page}$pageSize=${pageSize}`)
            .pipe(
                map(entities => entities.map(entity => this.mapper.fromEntity(entity)))
            );
    }

    //get product based on id
    getById(id: number): Observable<Product> {
        return this.http.get<ProductEntity>(`${this.apiUrl}/${id}`)
            .pipe(
                map(entity => this.mapper.fromEntity(entity))
            );
    }

    //get product based on product type/category
    getByType(type: string): Observable<Product> {
        return this.http.get<ProductEntity>(`${this.apiUrl}/${type}`)
            .pipe(
                map(entity => this.mapper.fromEntity(entity))
            );
    }

    getByPrice(price: number): Observable<Product> {
        return this.http.get<ProductEntity>(`${this.apiUrl}/${price}`)
            .pipe(
                map(entity => this.mapper.fromEntity(entity))
            );
    }

    //send post request using raw data model to match format expected by backend API and once request and respones saved in Entity,
    //map back entity back to product (application model) to return the data from backend so that
    // services can call this function to create data and display to the view (consistent and usable format within application).
    create(product: Product): Observable<Product> {
        return this.http
            .post<ProductEntity>(this.apiUrl, this.mapper.toEntity(product))
            .pipe(
                map(entity => this.mapper.fromEntity(entity))
            );
    }

    update(id: number, product: Product): Observable<Product> {
        return this.http
            .post<ProductEntity>(`{this.apiUrl}/${id}`, this.mapper.toEntity(product))
            .pipe(
                map(entity => this.mapper.fromEntity(entity))
            );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`)
    }

    searchByName(name: string): Observable<Product[]> {
        return this.http.get<ProductEntity[]>(`${this.apiUrl}/search?name=${name}`)
            .pipe(
                map(entities => entities.map(entity => this.mapper.fromEntity(entity)))
            );
    }

} 
