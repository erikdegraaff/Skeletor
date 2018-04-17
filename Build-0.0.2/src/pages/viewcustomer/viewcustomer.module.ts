import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewCustomerPage } from './viewcustomer';

@NgModule({
  declarations: [
    ViewCustomerPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewCustomerPage),
  ],
})
export class ViewcustomerPageModule {}
