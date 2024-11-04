
// Business models used in the application
export class Product {
    id?: number;
    name: string;
    type: string;
    price: number;
    description: string;
    imageUrl: string;

    //make all product properties optional or alternatively, use ?.
    constructor(data: Partial<Product>) {
        this.id = data.id;
        this.name = data.name || '';
        this.type = data.type || '';
        this.price = data.price || 0;
        this.description = data.description || '';
        this.imageUrl = data.imageUrl || '';
    }
}