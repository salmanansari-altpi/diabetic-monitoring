import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { DatabaseService } from 'src/shared/database/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  userData: any;

  constructor(
    private databaseService: DatabaseService,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  ngOnInit(): void {
    // this.showLoading();
    console.log("app page")
  }

  
}
