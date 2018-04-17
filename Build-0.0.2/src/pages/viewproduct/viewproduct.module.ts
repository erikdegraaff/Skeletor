import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewProductPage } from './viewproduct';

@NgModule({
  declarations: [
    ViewProductPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewProductPage),
  ],
})
export class ViewProductPageModule {}
