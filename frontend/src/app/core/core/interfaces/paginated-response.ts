export interface PaginatedResponse<T> {
    products: T[];  // matches your Go struct field name
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
