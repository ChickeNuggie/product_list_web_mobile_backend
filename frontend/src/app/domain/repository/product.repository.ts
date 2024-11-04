import { Observable } from "rxjs";
import { Product } from "src/app/models/product.model";

// Interface to Extend or Modify Reading Product List function easily.
export interface ProductRepository {
    getAll(page: number, pageSize: number): Observable<Product[]>;
    getById(id: number): Observable<Product>;
    getByType(type: string): Observable<Product>;
    getByPrice(price: number): Observable<Product>;
    create(product: Product): Observable<Product>;
    update(id: number, product: Product): Observable<Product>;
    delete(id: number): Observable<void>;
    searchByName(name: string): Observable<Product[]>;
}
