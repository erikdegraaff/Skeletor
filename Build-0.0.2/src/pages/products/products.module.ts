import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProductsPage } from './products';
import { DragulaModule, DragulaService } from 'ng2-dragula/ng2-dragula';

@NgModule({
  declarations: [
    ProductsPage,
  ],
  imports: [
    IonicPageModule.forChild(ProductsPage),
    DragulaModule
  ],
})
export class ProductsPageModule {}
