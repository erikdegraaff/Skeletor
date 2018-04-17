import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LayoutsPage } from './layouts';
import { DragulaModule, DragulaService } from 'ng2-dragula/ng2-dragula';

@NgModule({
  declarations: [
    LayoutsPage,
  ],
  imports: [
    IonicPageModule.forChild(LayoutsPage),
    DragulaModule
  ],
})
export class LayoutPageModule {}
