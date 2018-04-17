import { Component, ViewChild } from '@angular/core';
import { Nav } from 'ionic-angular';
import { MenuController } from 'ionic-angular';

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
import { AuthProvider } from '../providers/auth/auth';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = CountPage;
  isOpen: String;
  pages: any;

  public user: any;

  constructor(private menuCtrl: MenuController, private Auth: AuthProvider) {

        if(Auth.getUser()) {
          this.rootPage = CountPage;
        } else {
          this.rootPage = LoginPage;
        }

    this.user = {admin:1};
    this.pages = [
      { title: 'Frankeren', component: CountPage, admin:0 },
      { title: 'Klanten', component: ViewCustomerPage, admin:0 },
      { title: '- Klanten Beheren', component: CustomersPage, admin:1 },
      { title: '- Facturen Beheren', component: InvoicesPage, admin:1 },
      { title: 'Producten', component: ViewProductPage, admin:0 },
      { title: '- Producten Beheren', component: ProductsPage, admin:1 },
      { title: '- Product Groepen Beheren', component: ProductgroupsPage, admin:1 },
      { title: '- Layouts Beheren', component: LayoutsPage, admin:1 },
      { title: 'Koeriers', component: UsersPage, admin:1 }
    ];
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if(this.isOpen != page.title) {
      this.nav.setRoot(page.component);
      this.isOpen = page.title;
    } else {
      this.menuCtrl.close();
    }
  }
}
