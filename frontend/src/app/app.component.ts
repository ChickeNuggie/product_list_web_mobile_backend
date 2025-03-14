import { Component } from '@angular/core';
import { Product } from './models/product.model';

@Component({
  selector: 'app-root',
  template: `
  <div class="container">
      <app-product-list></app-product-list>
    </div>
  `,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  selectedProduct: Product | null = null;
}
