import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, EMPTY, finalize, map, Observable, tap, throwError } from "rxjs";
import { PaginatedResponse } from "src/app/core/core/interfaces/paginated-response";
import { CreateProductUseCase } from "src/app/domain/usecases/create-product-usecase";
import { DeleteProductUseCase } from "src/app/domain/usecases/delete-product.usecase";
import { GetProductUseCase } from "src/app/domain/usecases/get-product-use-case";
import { GetProductsUseCase } from "src/app/domain/usecases/GetProductsUseCase";
import { SearchProductsUseCase } from "src/app/domain/usecases/search-products.use-case";
import { UpdateProductUseCase } from "src/app/domain/usecases/update-product.usecase";
import { Product } from "src/app/models/product.model";
import { FilterParams } from "src/app/shared/interfaces/filter-params";

export interface ProductState {
    products: Product[];
    selectedProduct: Product | null;
    loading: boolean;
    error: string | null;
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    sortBy: 'name' | 'price_asc' | 'price_desc';
    filterBy: string;
    isEditMode: boolean;
}

//Single State object - atomic updates, state consistency, derieved state, debug friendly, easy to add new features, state history/time travel,performance
// One-time subscription instead of multiple subscription to field observables.
@Injectable({
    providedIn: 'root' // You can also specify 'root' here to make it available app-wide
})
export class ProductListViewmodel {
    // Store all product types once when data is first loaded, separately from filtered products to avoid loading specific values.
    private allProductTypes: string[] = [];
    // observable data source that holds the latest value. It emits new values whenever next() is called.
    // it stores value and emit new values
    private productTypesSubject = new BehaviorSubject<string[]>([]);
    // observable that other parts of the app (component) can subscribe to and auto receive udpates when product types change.
    // it hides .next() method so other parts of the app can read but not modify data.
    readonly productTypes$ = this.productTypesSubject.asObservable();
    // When productTypesSubject updates, any component that subscribes to productTypes$ will automatically get the latest product types.
    //  No need to manually fetch or pass the data around.


    private readonly initialState: ProductState = {
        products: [],
        selectedProduct: null,
        loading: false,
        error: null,
        currentPage: 1,
        pageSize: 5, //change to 10 later
        totalItems: 0,
        totalPages: 0,
        sortBy: 'name',
        filterBy: '',
        isEditMode: false
    };

    // publicly access this function's info (read only)
    get state() {
        return this.stateSubject;
    }
    // observable data source that holds the latest value. It emits new values whenever next() is called.
    private stateSubject = new BehaviorSubject<ProductState>(this.initialState);

    // private paginationSubject = new BehaviorSubject<{ page: number; pageSize: number }>({
    //     page: 1,
    //     pageSize: 5,
    // });


    //Selectors provide easy access to specific state properties, allows computedd/complex selectors like filtering
    // Without selectors, components would need to do this:
    // this.viewModel.state.pipe(map(state => state.products))
    readonly products$ = this.stateSubject.pipe(map(state => state.products));
    readonly loading$ = this.stateSubject.pipe(map(state => state.loading));
    readonly error$ = this.stateSubject.pipe(map(state => state.error));
    readonly selectedProduct$ = this.stateSubject.pipe(map(state => state.selectedProduct));
    readonly currentPage$ = this.stateSubject.pipe(map(state => state.currentPage));
    readonly isEditMode$ = this.stateSubject.pipe(map(state => state.isEditMode));
    readonly pageSize$ = this.stateSubject.pipe(map(state => state.pageSize));
    readonly totalItems$ = this.stateSubject.pipe(map(state => state.totalItems));
    readonly totalPages$ = this.stateSubject.pipe(map(state => state.totalPages));
    // readonly pagination$ = this.paginationSubject.asObservable(); // Expose observable

    constructor(
        private getProductsUseCase: GetProductsUseCase,
        private createProductUseCase: CreateProductUseCase,
        private updateProductUseCase: UpdateProductUseCase,
        private deleteProductUseCase: DeleteProductUseCase,
        private getProductUseCase: GetProductUseCase,
        private searchProductsUseCase: SearchProductsUseCase
    ) { }

    // update (.next()) state of viewmodel instead changing individually by merging old state with new state in parameter.
    // consistent update and keep state centralized.
    private setState(partialState: Partial<ProductState>) {
        this.stateSubject.next({
            ...this.stateSubject.value,
            ...partialState
        });
    }

    searchProducts(name: string) {
        this.setState({ loading: true, error: null });

        return this.searchProductsUseCase.execute(name).pipe(
            tap(products => {
                if (products.length === 0) {
                    // No products found
                    this.setState({
                        products: [],
                        loading: false,
                        // error: `No products found matching "${name}"`
                        error: ""
                    });
                    console.log('No search results found');
                } else {
                    // Products found
                    this.setState({
                        products,
                        loading: false,
                        error: null
                    });
                    console.log('Search results:', products);
                }
            }),
            catchError(error => {
                console.error('Search error:', error);
                this.setState({
                    products: [],
                    error: error.message,
                    loading: false
                });
                return EMPTY;
            })
        ).subscribe();
    }

    // Load Products
    // loadProducts(): void {

    //     this.setState({ loading: true, error: null });

    //     this.getProductsUseCase
    //         .execute(this.state.value.currentPage, this.state.value.pageSize)
    //         .pipe(finalize(() => this.setState({ loading: false })))
    //         .subscribe({
    //             next: (products) => {
    //                 this.setState({
    //                     products,
    //                     totalItems: products.length
    //                 });
    //             },
    //             error: (error) => this.setState({ error: error.message })
    //         });
    // }

    loadProducts(params?: FilterParams): void {
        const defaultParams: FilterParams = {
            page: this.stateSubject.value.currentPage,
            pageSize: this.stateSubject.value.pageSize
        };

        const filterParams = { ...defaultParams, ...params };

        // Add console log to verify parameters
        console.log('ViewModel Load Products Params:', filterParams);

        this.setState({ loading: true, error: null });

        this.getProductsUseCase.execute(filterParams)
            .pipe(finalize(() => this.setState({ loading: false })))
            .subscribe({
                next: (response) => {

                    // Parse dates for each product by merging changes from the product in response.
                    // Ensure each product has a createAt field
                    const productsWithDates = response.products.map(product => ({
                        ...product,
                        created_at: product.created_at ? new Date(product.created_at) : new Date()
                    }));

                    this.setState({
                        products: productsWithDates,
                        totalItems: response.total,
                        currentPage: response.page,
                        totalPages: response.totalPages
                    });

                    // Extract all product types once on initial load
                    if (this.allProductTypes.length === 0) {
                        // new set = removes duplicate and keep unique values from each type of product in response
                        // [] converts set back to array
                        const types = [...new Set(response.products.map(product => product.type))];
                        console.log('Extracted product types:', types);
                        this.allProductTypes = types;
                        // update the subject with new types and sends to any subscribers who listening or needs this data.
                        this.productTypesSubject.next(types);
                    }
                },
                error: (error) => {
                    console.error('Error Loading Products:', error);
                    this.setState({ error: error.message })
                }
            });
    }

    // Create Product
    createProduct(product: Product): Observable<Product> {
        return this.createProductUseCase.execute(product).pipe(
            tap((newProduct) => {
                this.setState({
                    products: [...this.stateSubject.value.products, newProduct],
                    isEditMode: false
                });
            }),
            catchError((error) => {
                this.setState({ error: error.message });
                return throwError(() => error);
            })
        );
    }

    // Update Product
    updateProduct(id: number, product: Product): Observable<Product> {
        this.setState({ loading: true, error: null });

        return this.updateProductUseCase.execute(id, product).pipe(
            tap((updatedProduct) => {
                // const products = [...this.state.value.products];
                // const index = products.findIndex(p => p.id === id);
                // if (index !== -1) {
                //     products[index] = updatedProduct;
                // }
                // Update the products array with the updated product
                const currentProducts = this.stateSubject.value.products;
                const updatedProducts = currentProducts.map(p =>
                    p.id === id ? updatedProduct : p
                );
                console.log('Updated products array:', currentProducts); // Debug log
                this.setState({
                    products: updatedProducts,
                    // products,
                    selectedProduct: null,
                    isEditMode: false
                });
            }),
            catchError((error) => {
                this.setState({ error: error.message });
                return throwError(() => error);
            }),
            finalize(() => this.setState({ loading: false }))
        );
    }

    // Delete Product
    deleteProduct(id: number): void {
        this.setState({ loading: true, error: null });

        this.deleteProductUseCase
            .execute(id)
            .pipe(finalize(() => this.setState({ loading: false })))
            .subscribe({
                next: () => {
                    this.setState({
                        products: this.stateSubject.value.products.filter(p => p.id !== id),
                        selectedProduct: null
                    });
                },
                error: (error) => this.setState({ error: error.message })
            });
    }

    loadStateProduct(id: number): void {
        this.setState({ loading: true });

        this.getProductUseCase.execute(id).pipe(
            finalize(() => this.setState({ loading: false }))
        ).subscribe({
            next: (product) => {
                this.setState({ selectedProduct: product });
            },
            error: (error) => {
                this.setState({ error: error.message });
            }
        });
    }

    clearSelectedProduct(): void {
        this.setState({
            selectedProduct: null,
            isEditMode: false
        });
    }

    goToFirstPage() {
        this.setState({ currentPage: 1 });
        this.loadProducts();
    }

    goToPreviousPage() {
        if (this.stateSubject.value.currentPage > 1) {
            this.setState({ currentPage: this.stateSubject.value.currentPage - 1 });
            this.loadProducts();
        }
    }
    // check if there's next page like flipping a book (current page / total page)
    goToNextPage() {
        if (this.stateSubject.value.currentPage < this.stateSubject.value.totalPages) {
            this.setState({ currentPage: this.stateSubject.value.currentPage + 1 });
            this.loadProducts();
        }
    }

    goToLastPage() {
        this.setState({ currentPage: this.stateSubject.value.totalPages });
        this.loadProducts();
    }
}



