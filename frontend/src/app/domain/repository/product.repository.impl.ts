import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { ProductRepository } from "./product.repository";
import { catchError, map, Observable, of, tap, throwError } from "rxjs";
import { Product } from "src/app/models/product.model";
import { ProductEntity } from "../entities/product.entity";
import { ProductMapper } from "src/app/mappers/product.mapper";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { PaginatedResponse } from "src/app/core/core/interfaces/paginated-response";
import { FilterParams } from "src/app/shared/interfaces/filter-params";

// Implements the interface of repository.
// Manages the data access to the product list so that
// the view model wont have to worry about details of fetching or updatomg product data.
// Primarily For data access to directly make http request and map data before displaying to the service to do business logic and then to the view.
@Injectable({
    providedIn: 'root'
})
export class ProductRepositoryImpl extends ProductRepository {
    //use relative path and let proxy to handle routing by configure proxy.config.json to point to go's backend port.
    // Easier to change backend url as hardcode url bypassess, causing CORS issue in development and harder to get request from frontend.
    // the proxy file - Original Request: http://localhost:4200/api/products => Transformed to: http://localhost:8080/api/products
    //The proxy (like a message carrier) makes them work together smoothly while keeping them independent. This makes development faster and maintenance easier.
    //Can work independently, Live reload works better, Different teams can work separately, Easier to debug each part
    private apiUrl: string;

    constructor(
        private http: HttpClient,
        private mapper: ProductMapper
    ) {
        super();
        this.apiUrl = `${environment.apiUrl}/products`;// Note: /products added here as api comes from environment (global) setting.
    }

    // get all product based on page size.
    getAll(page: number = 1, pageSize: number = 10): Observable<Product[]> {
        console.log('Making request to:', `${this.apiUrl}?page=${page}&pageSize=${pageSize}`);

        return this.http.get<any>(`${this.apiUrl}?page=${page}&pageSize=${pageSize}`)
            .pipe(
                map(response => {
                    console.log('Raw response from API:', response);
                    console.log('Products from response:', response.products);

                    const mappedProducts = response.products.map((entity: ProductEntity) => {
                        console.log('Mapping entity:', entity);
                        const mappedProduct = this.mapper.fromEntity(entity);
                        console.log('Mapped to product:', mappedProduct);
                        return mappedProduct;
                    });

                    console.log('Final mapped products:', mappedProducts);
                    return mappedProducts;
                })
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
        const productFormData = this.mapper.toProductMapFormData(product);

        return this.http
            .post<ProductEntity>(this.apiUrl, productFormData)
            .pipe(
                map(entity => this.mapper.fromEntity(entity))
            );
    }

    update(id: number, product: Product): Observable<Product> {
        const productFormData = this.mapper.toProductMapFormData(product);

        // return this.http
        //     .put<ProductEntity>(`${this.apiUrl}/${id}`, this.mapper.toEntity(productFormData))
        //     .pipe(
        //         map(entity => this.mapper.fromEntity(entity))
        //     );

        return this.http
            .put<ProductEntity>(`${this.apiUrl}/${id}`, productFormData)
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
                tap(response => console.log('Raw API response:', response)), // Debug log
                map(entities => {
                    // Handle null/undefined response by returning empty array
                    if (!entities) return [];
                    return entities.map(entity => this.mapper.fromEntity(entity));
                }),
                catchError(error => {
                    console.error('Search error:', error);
                    // Return empty array on error
                    return of([]);
                })
            );
    }

    getImageUrl(imageUrl: string): string {
        if (!imageUrl) {
            return '';
        }
        // Clean up the path to avoid double 'uploads'
        const cleanImageUrl = imageUrl.replace('/uploads/', '');
        return `${environment.uploadsUrl}/${cleanImageUrl}`;
    }

    getProducts(params: FilterParams): Observable<PaginatedResponse<Product>> {
        const queryParams = new HttpParams()
            .set('page', params.page.toString())
            .set('pageSize', params.pageSize.toString())
            .set('type', params.type || '')
            .set('minPrice', params.minPrice?.toString() || '')
            .set('maxPrice', params.maxPrice?.toString() || '')
            .set('sortBy', params.sortBy || '')
            .set('sortOrder', params.sortOrder || '');

        return this.http.get<PaginatedResponse<Product>>(`${this.apiUrl}`, { params: queryParams });
    }
} 
