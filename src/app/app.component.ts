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
    this.showLoading();
  }

  async loadUsers() {
    this.userData = await this.databaseService.getUsers();
    // console.log(this.router.url);
    if (this.userData) {
      // console.log(this.router.url);
      this.router.navigateByUrl('signed');
    }
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      spinner: 'crescent',
      duration: 500,
      animated: true,
      backdropDismiss: true,
      translucent: true,
    });

    loading.present().then(() => {
      this.loadUsers();
    });
  }
}
