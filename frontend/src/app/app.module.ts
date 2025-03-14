import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductListComponent } from './features/products/components/product-list/product-list.component';
import { ProductFormComponent } from './features/products/components/product-form/product-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ProductRepositoryImpl } from './domain/repository/product.repository.impl';
import { ProductListViewmodel } from './features/products/viewmodels/product-list.viewmodel';
import { ProductMapper } from './mappers/product.mapper';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { GetProductUseCase } from './domain/usecases/get-product-use-case';
import { CreateProductUseCase } from './domain/usecases/create-product-usecase';
import { DeleteProductUseCase } from './domain/usecases/delete-product.usecase';
import { GetProductsUseCase } from './domain/usecases/GetProductsUseCase';
import { UpdateProductUseCase } from './domain/usecases/update-product.usecase';
import { ImageUrlPipe } from './shared/pipes/image-url.pipe';
import { SearchProductsUseCase } from './domain/usecases/search-products.use-case';


@NgModule({
  declarations: [
    AppComponent,
    ProductListComponent,
    ProductFormComponent,
    ImageUrlPipe
  ],
  imports: [
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    LoggerModule.forRoot({
      level: NgxLoggerLevel.DEBUG,           // Adjust log level as needed
      serverLogLevel: NgxLoggerLevel.ERROR,  // Level of logs sent to server
      disableConsoleLogging: false           // Enable or disable console logging
    }),
  ],
  providers: [
    {
      provide: 'ProductRepository',
      useClass: ProductRepositoryImpl
    },
    ProductListViewmodel,
    ProductMapper,
    CreateProductUseCase,
    UpdateProductUseCase,
    GetProductsUseCase,
    DeleteProductUseCase,
    GetProductUseCase,
    SearchProductsUseCase
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }