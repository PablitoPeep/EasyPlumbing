import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProvidePageRoutingModule } from './provide-routing.module';

import { ProvidePage } from './provide.page';
import { IonicDatePickerModule } from 'ionic-datepicker';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProvidePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ProvidePage]
})
export class ProvidePageModule {}
