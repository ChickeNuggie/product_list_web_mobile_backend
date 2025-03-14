//Raw data from backend
export interface ProductEntity { // Checkpoint before ai replacement
    id?: number;
    name: string;
    type: string;
    price: number;
    description: string;
    image_url?: string;
    image?: File | null
    created_at?: Date;
    status?: string;
}