import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { ProductListViewmodel } from '../../viewmodels/product-list.viewmodel';
import { finalize, Observable, Subject, take, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  @Input() product: Product | null = null;
  productForm: FormGroup;
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  isSubmitting = false;
  isLoading$: Observable<boolean>;
  // route: any;

  private destroy$ = new Subject<void>();
  isEditMode = false;
  productId?: number;

  // Create observables for the component
  selectedProduct$ = this.productListviewModel.selectedProduct$;
  // isLoading$ = this.productListviewModel.loading$;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public productListviewModel: ProductListViewmodel,
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      price: [null, [
        Validators.required,
        Validators.min(0),
        Validators.pattern(/^\d*\.?\d{0,2}$/) // Only allow numbers with up to 2 decimal places
      ]],
      description: [''],
      image: [null],  // For file upload
      image_url: [null]  // For displaying existing image
    });

    this.isLoading$ = this.productListviewModel.loading$;
  }

  ngOnInit() {
    // Check for id in query params for edit mode
    // Clear any previous state when component initializes
    this.clearProductStateForm();


    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.productId = +id;
        console.log('Loading product with ID:', this.productId);
        this.productListviewModel.loadStateProduct(this.productId);
      }
    });

    // Subscribe to selected product changes
    this.selectedProduct$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(product => {
      if (product) {
        console.log('Selected product:', product); // Debug log
        this.productForm.patchValue({
          name: product.name,
          type: product.type,
          price: product.price,
          description: product.description,
          image_url: product.image_url,
          image: product.image
        });

        if (product.image_url) {
          this.imagePreview = product.image_url;
          console.log('Image URL:', this.imagePreview);
        }
      } else {
        //alternatively
        this.productForm.reset();
      }
    });

    // Log when form values change
    this.productForm.valueChanges.subscribe(values => {
      console.log('Form values changed:', values);
    });

    // Check if product types are already loaded
    this.productListviewModel.productTypes$.pipe(
      take(1) // Take only the first emission
    ).subscribe(types => {
      // If types array is empty, load product types
      if (!types || types.length === 0) {
        this.productListviewModel.loadProducts();
      }
    });
  }


  // onFileSelected(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.selectedFile = file;

  //     // Create a preview
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.imagePreview = reader.result as string;
  //     };
  //     reader.readAsDataURL(file);

  //     // If you want to add the file to your form data
  //     this.productForm.patchValue({
  //       image: file
  //     });
  //   }
  // }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file || null;
    if (file) {
      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File is too large. Maximum size is 5MB');
        return;
      }

      const fileInput = event.target as HTMLInputElement;
      const filesInput = fileInput.files?.[0];

      if (!filesInput) return; // Exit if no file is selected

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(filesInput.type)) {
        alert('Invalid file type. Only JPG, PNG and GIF are allowed');
        fileInput.value = '';
        return;
      }

      if (file) {
        this.productForm.patchValue({
          image: file
        });
        // Create a preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.imagePreview = null;
    this.selectedFile = null;

    // Make image required again by setting it to null in the form (update form)
    this.productForm.patchValue({
      image: null,
      image_url: null
    });


    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Add this to your component
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

  onSubmit() {
    console.log('Submit button clicked');
    console.log('Form valid state:', this.productForm.valid);
    console.log('Form values:', this.productForm)
    // Debug which fields are invalid
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      console.log(`Field ${key} valid:`, control?.valid, 'Errors:', control?.errors);
    });
    // if (this.productForm.valid) {
    //   const productFormData = this.productForm.value;

    //   const productData = new Product({
    //     id: this.productId,
    //     name: productFormData.name,
    //     type: productFormData.type,
    //     price: parseFloat(productFormData.price),
    //     description: productFormData.description,
    //     image: this.selectedFile
    //   });
    //   console.log('Product Data to Update:', productData); // Debug log

    //   console.log('Submitting product data:', productData); // Debug log
    //   this.isSubmitting = true;

    //   if (this.productId) {
    //     this.isSubmitting = true;
    //     this.productListviewModel.updateProduct(this.productId, productData)
    //       .pipe(
    //         finalize(() => {
    //           this.isSubmitting = false;
    //           console.log('Update operation completed');
    //         })
    //       )
    //       .subscribe({
    //         next: (response) => {
    //           console.log('Update successful:', response);
    //           this.productListviewModel.loadProducts();
    //           this.router.navigate(['/products']);
    //         },
    //         error: (error) => {
    //           console.error('Update failed:', error);
    //           // Show error to user
    //           // For example:
    //           alert('Failed to update product: ' + error.message);
    //         }
    //       });
    //   }
    // } else {
    //   console.log('Form is invalid:', this.productForm.errors);
    // }
    // Always allow edit mode to submit by bypass even
    // if (this.isEditMode || this.productForm.valid) {
    if (this.productForm.valid) {
      console.log('Preparing to submit valid form');

      const productData = new Product({
        name: this.productForm.get('name')?.value,
        type: this.productForm.get('type')?.value,
        price: this.productForm.get('price')?.value,
        description: this.productForm.get('description')?.value,
        image_url: this.productForm.get('image_url')?.value, // Direct URL assignment
        image: this.productForm.get('image')?.value
      });

      // const productFormData = this.mapper.toProductMapFormData(productData);

      this.isSubmitting = true;

      if (this.productId) {
        console.log('Attempting to update product with ID:', this.productId);
        this.productListviewModel.updateProduct(this.productId, productData)
          .subscribe({
            next: (response) => {
              console.log('Product updated successfully', response);
              console.log('Attempting navigation to /products');
              this.router.navigate(['/products']);
            },
            error: (error) => {
              console.error('Update request failed with error:', error);
              this.isSubmitting = false;
            },
            complete: () => {
              console.log('Update observable completed');
            }
          });
      } else {
        this.productListviewModel.createProduct(productData)
          .subscribe({
            next: (response) => {
              console.log('Product created successfully', response);
              this.router.navigate(['/products']);
            },
            error: (error) => {
              console.error('Error in product operation', error);
              this.isSubmitting = false;
            }
          });
      }
    }

  }

  clearProductStateForm(): void {
    this.isEditMode = false;
    this.productId = undefined;
    this.imagePreview = null;
    this.selectedFile = null;
    this.productListviewModel.clearSelectedProduct();
    this.productForm.reset();
  }

  // Add ngOnDestroy to clear state when leaving the component
  ngOnDestroy() {
    this.clearProductStateForm();
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasImage(): boolean {
    // Check if either a selected file or an image URL exists.
    // !! used to state function will always return true if optional conditional value exist.
    //prevents unexpected empty string or 0 in conditions if you just want true/false return value.
    return !!(this.selectedFile || this.imagePreview ||
      this.productForm.get('image')?.value ||
      this.productForm.get('image_url')?.value);
  }

  isFormValid(): boolean {
    const hasRequiredFields = !!(
      this.productForm.get('name')?.value &&
      this.productForm.get('type')?.value &&
      this.productForm.get('price')?.value
    );

    // Add image validation
    const hasImageData = this.hasImage();

    return hasRequiredFields && hasImageData;
  }
}
