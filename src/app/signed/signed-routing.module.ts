import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SignedPage } from './signed.page';

const routes: Routes = [
  {
    path: '',
    component: SignedPage,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomePageModule),
      },
      {
        path: 'setting',
        loadChildren: () =>
          import('./setting/setting.module').then((m) => m.SettingPageModule),
      },
      {
        path: 'transactions',
        loadChildren: () =>
          import('./transactions/transactions.module').then(
            (m) => m.TransactionsPageModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignedPageRoutingModule {}
