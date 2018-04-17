import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { CountPage } from '../pages/count/count';
import { ProductsPage } from '../pages/products/products';
import { ProductgroupsPage } from '../pages/productgroups/productgroups';
import { CustomersPage } from '../pages/customers/customers';
import { LayoutsPage } from '../pages/layouts/layouts';
import { ViewCustomerPage } from '../pages/viewcustomer/viewcustomer';
import { ViewProductPage } from '../pages/viewproduct/viewproduct';
import { InvoicesPage } from '../pages/invoices/invoices';
import { UsersPage } from '../pages/users/users';
import { LoginPage } from '../pages/login/login';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { DragulaModule, DragulaService } from 'ng2-dragula/ng2-dragula';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
import { SocketProvider } from '../providers/socket/socket';
import { AuthProvider } from '../providers/auth/auth';

// THUIS
const config: SocketIoConfig = { url: 'http://192.168.2.2:3000', options: {} };

@NgModule({
  declarations: [
    MyApp,
    CountPage, // ----- comment this running --prod 
    ProductsPage,
    ProductgroupsPage,
    CustomersPage,
    LayoutsPage,
    ViewCustomerPage,
    ViewProductPage,
    InvoicesPage,
    UsersPage,
    LoginPage // ----- comment this running --prod
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      /* activator:'ripple' */
    }),
    SocketIoModule.forRoot(config),
    DragulaModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    CountPage,
    ProductsPage,
    ProductgroupsPage,
    CustomersPage,
    LayoutsPage,
    ViewCustomerPage,
    ViewProductPage,
    InvoicesPage,
    UsersPage,
    LoginPage    
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DragulaService,
    SocketProvider,
    AuthProvider,
  ]
})
export class AppModule {}
