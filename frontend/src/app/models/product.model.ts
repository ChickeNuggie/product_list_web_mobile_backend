
// Business models used in the application
export class Product {// Checkpoint
    id?: number;
    name: string;
    type: string;
    price: number;
    description: string;
    image_url?: string; // fpr existing file.
    image?: File | null;  // For file upload
    created_at: Date; // ensure properly initialized.
    status?: string;

    //make all product properties optional or alternatively, use ?.

    constructor(data: Partial<Product>) {
        this.id = data.id;
        this.name = data.name || '';
        this.type = data.type || '';
        this.price = data.price || 0;
        this.description = data.description || '';
        // this.image_url = data.image_url || 'https://imgur.com/RrMBjqE.jpg';
        this.image_url = data.image_url;
        this.image = data.image || null;
        // Always set createAt to a Date object
        this.created_at = data.created_at ? new Date(data.created_at) : new Date();
        this.status = data.status;
    }

    // Helper method to convert to FormData
    // toProductFormData(): FormData {
    //     const productFormData = new FormData();

    //     // Add all fields, including ID
    //     if (this.id) {
    //         productFormData.append('id', this.id.toString());
    //     }
    //     productFormData.append('name', this.name);
    //     productFormData.append('type', this.type);
    //     productFormData.append('price', this.price.toString());
    //     productFormData.append('description', this.description);

    //     if (this.image instanceof File) {
    //         productFormData.append('image', this.image);
    //     }

    //     // Add basic fields
    //     if (this.id) productFormData.append('id', this.id.toString());
    //     productFormData.append('name', this.name);
    //     productFormData.append('type', this.type);
    //     productFormData.append('price', this.price.toString());
    //     productFormData.append('description', this.description);

    //     // Add optional fields
    //     if (this.status) productFormData.append('status', this.status);
    //     if (this.createAt) productFormData.append('createAt', this.createAt.toISOString());

    //     // Handle image
    //     if (this.image instanceof File) {
    //         productFormData.append('image', this.image);
    //     }

    //     console.log('FormData contents:');
    //     productFormData.forEach((value, key) => {
    //         console.log(`${key}: ${value}`);
    //     });

    //     return productFormData;
    // }

    // Static method to create a product with business rules
    static createWithBusinessRules(data: Partial<Product>): Product {
        return new Product({
            ...data,
            created_at: new Date(),
            status: 'active'
        });
    }
}