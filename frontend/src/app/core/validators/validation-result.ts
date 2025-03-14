import { Injectable } from "@angular/core";
import { Product } from "src/app/models/product.model";

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

@Injectable({
    providedIn: 'root'
})

//Avoid complex validation rules in view model before displaying to the view.
export class ProductValidator {
    validateProduct(product: Product): ValidationResult {
        console.log('Validating product:', product); // Debug log
        const errors: string[] = [];

        // Validate required fields
        if (!product.name?.trim()) {
            errors.push('Product name is required');
        }

        if (!product.type?.trim()) {
            errors.push('Product type is required');
        }

        if (product.price === undefined || product.price === null) {
            errors.push('Product price is required');
        }

        // Validate price
        if (product.price !== undefined && product.price !== null) {
            if (product.price < 0) {
                errors.push('Price cannot be negative');
            }
            if (product.price > 1000000) {
                errors.push('Price cannot exceed 1,000,000');
            }
        }

        // Validate name length
        if (product.name && (product.name.length < 1 || product.name.length > 100)) {
            errors.push('Product name must be between 3 and 100 characters');
        }

        // Validate description length if provided
        if (product.description && product.description.length > 500) {
            errors.push('Description cannot exceed 500 characters');
        }

        // Validate image URL format if provided
        if (product.image_url && !this.isValidUrl(product.image_url)) {
            errors.push('Invalid image URL format');
        }

        console.log('Validation results:', { isValid: errors.length === 0, errors }); // Debug log

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    validatePagination(page: number, pageSize: number): ValidationResult {
        const errors: string[] = [];

        if (!Number.isInteger(page) || page < 1) {
            errors.push('Page must be a positive integer');
        }

        if (!Number.isInteger(pageSize) || pageSize < 1) {
            errors.push('Page size must be a positive integer');
        }

        if (pageSize > 100) {
            errors.push('Page size cannot exceed 100 items');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // private isValidUrl(url: string): boolean {
    //     try {
    //         //check for valid url format but not if it exist or accessbile. (https://example.com)
    //         new URL(url);
    //         return true;
    //     } catch {
    //         return false;
    //     }
    // }
    private isValidUrl(url: string): boolean {
        // Accept relative paths that start with '/' and end with image extensions
        if (url.startsWith('/')) {
            const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            return validExtensions.some(ext => url.toLowerCase().endsWith(ext));
        }

        // Otherwise check for complete URLs
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}