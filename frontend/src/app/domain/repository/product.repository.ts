import { Observable } from "rxjs";
import { PaginatedResponse } from "src/app/core/core/interfaces/paginated-response";
import { Product } from "src/app/models/product.model";
import { FilterParams } from "src/app/shared/interfaces/filter-params";

// Interface to Extend or Modify Reading Product List function easily.
export abstract class ProductRepository {
    abstract getAll(page: number, pageSize: number): Observable<Product[]>;
    abstract getById(id: number): Observable<Product>;
    abstract getByType(type: string): Observable<Product>;
    abstract getByPrice(price: number): Observable<Product>;
    abstract create(product: Product): Observable<Product>;
    abstract update(id: number, product: Product): Observable<Product>;
    abstract delete(id: number): Observable<void>;
    abstract searchByName(name: string): Observable<Product[]>;
    abstract getProducts(params: FilterParams): Observable<PaginatedResponse<Product>>;
}
