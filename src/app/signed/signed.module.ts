import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignedPageRoutingModule } from './signed-routing.module';

import { SignedPage } from './signed.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SignedPageRoutingModule
  ],
  declarations: [SignedPage]
})
export class SignedPageModule {}
