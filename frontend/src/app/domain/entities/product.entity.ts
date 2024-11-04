//Raw data from backend
export interface ProductEntity {
    id?: number;
    name: string;
    type: string;
    price: number;
    description: string;
    imageUrl: string;
    createdAt?: Date;
    updatedAt?: Date;
}