import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';

@NgModule({
  declarations: [HomePage],
  imports: [CommonModule, FormsModule, IonicModule, HomePageRoutingModule],
})
export class HomePageModule {}
