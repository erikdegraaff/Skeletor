import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProductgroupsPage } from './productgroups';
import { DragulaModule, DragulaService } from 'ng2-dragula/ng2-dragula';

@NgModule({
  declarations: [
    ProductgroupsPage,
  ],
  imports: [
    IonicPageModule.forChild(ProductgroupsPage),
    DragulaModule
  ],
})
export class ProductgroupsPageModule {}
