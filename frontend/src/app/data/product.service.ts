import { HttpClient, HttpParams } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { ProductFilter } from '../domain/entities/product.filter.entity';
import { catchError, Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductRepositoryImpl } from '../domain/repository/product.repository.impl';

@Injectable({
  providedIn: 'root'
})
// Focus on connecting repository that retrieves raw datra from backend and convert to application model data
//, apply business logic and displayy to view and handle user interaction.
export class ProductService {

  constructor(private repository: ProductRepositoryImpl) { }

  getProducts(page: number, pageSize: number): Observable<Product[]> {
    return this.repository.getAll(page, pageSize);
  }

  getProductsById(id: number): Observable<Product> {
    return this.repository.getById(id);
  }

  getProductsByType(type: string): Observable<Product> {
    return this.repository.getByType(type);
  }

  getProductsByPrice(price: number): Observable<Product> {
    return this.repository.getByPrice(price);
  }

  deleteProduct(id: number): Observable<void> {
    return this.repository.delete(id);
  }

  searchProducts(name: string): Observable<Product[]> {
    return this.repository.searchByName(name);
  }

  createProduct(product: Product): Observable<Product> {
    return this.repository.create(product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.repository.update(id, product);
  }
}
