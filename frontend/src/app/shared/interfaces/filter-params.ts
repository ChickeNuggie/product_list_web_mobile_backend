export interface FilterParams {
    page: number;
    pageSize: number;
    type?: string;
    minPrice?: number | null;
    maxPrice?: number | null;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
