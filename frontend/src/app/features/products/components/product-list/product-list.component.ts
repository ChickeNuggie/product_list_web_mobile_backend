import { Component, Input, OnInit } from '@angular/core';
import { ProductListViewmodel } from '../../viewmodels/product-list.viewmodel';
import { Product } from 'src/app/models/product.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, take } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { getRelativeTime } from 'src/app/utils/dateTimeFormat';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  searchForm = new FormGroup({
    search: new FormControl('')
  });
  // searchControl = new FormControl('');
  selectedProduct: Product | null = null;
  dateTime: Date = new Date(); // Example usage


  //form control for filter
  minPriceControl = new FormControl();
  maxPriceControl = new FormControl();
  currentFilters = {
    type: '',
    minPrice: null,
    maxPrice: null,
    sortBy: '',
    sortOrder: '',
    itemPage: 1,
    itemSize: 5,
  };

  constructor(public productListViewModel: ProductListViewmodel, private router: Router) {
    // Setup debounced price filter changes
    this.minPriceControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.currentFilters.minPrice = value;
      this.applyFilters();
    });

    this.maxPriceControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(value => {
      this.currentFilters.maxPrice = value;
      this.applyFilters();
    });


  }


  onSubmit() {
    const searchTerm = this.searchForm.get('search')?.value as string;
    if (searchTerm?.trim()) {
      this.productListViewModel.searchProducts(searchTerm.trim());
    }
  }

  ngOnInit() {
    // console.log('ProductListComponent loaded');
    // this.productListViewModel.loadProducts();

    console.log('ProductListComponent loaded');
    this.loadProductsWithPagination();

    // Watch for form value changes
    this.searchForm.get('search')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((term: string | null) => {
      // If term becomes empty/null, reload all products
      if (!term || !term.trim()) {
        this.productListViewModel.loadProducts();
      }
    });
  }

  // onProductSelect(product: Product | null): void {
  //   this.selectedProduct = product;
  //   if (product?.id) {
  //     this.productListViewModel.loadProductById(product.id);
  //   }
  // }


  navigateToAddProduct() {
    this.productListViewModel.clearSelectedProduct();
    this.router.navigate(['/products/create']);
  }

  onDelete(id: number | undefined): void {
    if (id && confirm('Are you sure you want to delete this product?')) {
      this.productListViewModel.deleteProduct(id);
    }

    this.loadProductsWithPagination()
  }

  // getImageUrl(image_url: string): string {
  //   if (!image_url) {
  //     console.log('No image URL provided');
  //     return '';
  //   }
  //   // Since imageUrl already includes '/uploads/', we don't need to add it again
  //   const fullUrl = `${environment.uploadsUrl}${image_url}`;
  //   console.log('Constructed image URL:', fullUrl);
  //   return fullUrl;
  // }

  handleImageError(event: any) {
    // Replace broken images with a placeholder
    event.target.src = 'assets/placeholder-image.png';
  }

  // Add edit navigation
  onEdit(id: number | undefined) {
    if (id) {
      // Use route parameters instead of query parameters
      this.router.navigate([`/products/edit/${id}`]);
    }
  }

  // private applyFilters() {
  //   this.productListViewModel.loadProducts({
  //     page: 1, // Reset to first page when filters change
  //     pageSize: 20,
  //     type: this.currentFilters.type,
  //     minPrice: this.currentFilters.minPrice,
  //     maxPrice: this.currentFilters.maxPrice,
  //     sortBy: this.currentFilters.sortBy,
  //     sortOrder: this.currentFilters.sortOrder as 'asc' | 'desc'
  //   });
  // }

  onTypeFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.currentFilters.type = select.value;
    this.applyFilters();
  }

  onSortChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;

    let sortBy: string;
    let sortOrder: string;

    // Special handling for created_at
    if (value.startsWith('created_at')) {
      sortBy = 'created_at';
      sortOrder = value.includes('asc') ? 'asc' : 'desc';
    } else {
      // Default splitting for other cases
      const parts = value.split('_');
      sortBy = parts[0];
      sortOrder = parts[1];
    }

    console.log('Sort By:', sortBy);
    console.log('Sort Order:', sortOrder);

    this.currentFilters.sortBy = sortBy;
    this.currentFilters.sortOrder = sortOrder;

    console.log('Current Filters:', this.currentFilters);

    this.applyFilters();
  }

  // private applyFilters() {
  //   const filterParams = {
  //     page: this.currentFilters.itemPage,
  //     pageSize: this.currentFilters.itemSize,
  //     type: this.currentFilters.type,
  //     minPrice: this.currentFilters.minPrice,
  //     maxPrice: this.currentFilters.maxPrice,
  //     sortBy: this.currentFilters.sortBy,
  //     sortOrder: this.currentFilters.sortOrder as 'asc' | 'desc'
  //   };

  //   // Add console log to verify exact parameters being sent
  //   console.log('Applied Filter Params:', filterParams);

  //   this.productListViewModel.loadProducts(filterParams);
  // }

  loadProductsWithPagination() {
    this.productListViewModel.loadProducts({
      page: this.currentFilters.itemPage,
      pageSize: this.currentFilters.itemSize,
      type: this.currentFilters.type,
      minPrice: this.currentFilters.minPrice,
      maxPrice: this.currentFilters.maxPrice,
      sortBy: this.currentFilters.sortBy,
      sortOrder: this.currentFilters.sortOrder as 'asc' | 'desc',
    });
  }

  private applyFilters() {
    // Reset to first page when filters change
    this.currentFilters.itemPage = 1;
    this.loadProductsWithPagination();
  }

  onPageChange(page: number) {
    this.currentFilters.itemPage = page;
    this.loadProductsWithPagination();
  }

  onPageSizeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.currentFilters.itemSize = parseInt(select.value, 10);
    this.currentFilters.itemPage = 1; // Reset to first page when changing page size
    this.loadProductsWithPagination();
  }

  // goToFirstPage() {
  //   this.productListViewModel.currentPage$.pipe(take(1)).subscribe(() => {
  //     this.onPageChange(1);
  //   });
  // }

  // goToPreviousPage() {
  //   this.productListViewModel.currentPage$.pipe(take(1)).subscribe(currentPage => {
  //     if (currentPage > 1) {
  //       this.onPageChange(currentPage - 1);
  //     }
  //   });
  // }

  // goToNextPage() {
  //   this.productListViewModel.currentPage$.pipe(take(1)).subscribe(currentPage => {
  //     this.productListViewModel.totalPages$.pipe(take(1)).subscribe(totalPages => {
  //       if (currentPage < totalPages) {
  //         this.onPageChange(currentPage + 1);
  //       }
  //     });
  //   });
  // }

  // goToLastPage() {
  //   this.productListViewModel.totalPages$.pipe(take(1)).subscribe(totalPages => {
  //     this.onPageChange(totalPages);
  //   });
  // }

  goToFirstPage() {
    this.productListViewModel.goToFirstPage();
  }

  goToPreviousPage() {
    this.productListViewModel.goToPreviousPage();
  }

  goToNextPage() {
    this.productListViewModel.goToNextPage();
  }

  goToLastPage() {
    this.productListViewModel.goToLastPage();
  }

  // getRelativeTime(date: Date | undefined): string {
  //   if (!date) return 'Unknown';

  //   const now = new Date();
  //   const diff = now.getTime() - date.getTime();

  //   // Time calculations
  //   const seconds = Math.floor(diff / 1000);
  //   const minutes = Math.floor(seconds / 60);
  //   const hours = Math.floor(minutes / 60);
  //   const days = Math.floor(hours / 24);

  //   if (days > 0) {
  //     return days === 1 ? '1 day ago' : `${days} days ago`;
  //   } else if (hours > 0) {
  //     return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  //   } else if (minutes > 0) {
  //     return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  //   } else {
  //     return seconds <= 10 ? 'just now' : `${seconds} seconds ago`;
  //   }
  // }

  getFormattedTime(date: Date | undefined): string {
    return getRelativeTime(date);
  }
}
