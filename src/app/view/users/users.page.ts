import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { LocalNotifications } from "@capacitor/local-notifications";
import { LoadingController } from "@ionic/angular";
import { DatabaseService } from "src/shared/database/database.service";

@Component({
  selector: "app-users",
  templateUrl: "./users.page.html",
  styleUrls: ["./users.page.scss"],
})
export class UsersPage implements OnInit {
  userData: any;
  constructor(
    private databaseService: DatabaseService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    console.log("users page");
    this.loadUsers();
  }

  async Permission() {
    try {
      await LocalNotifications.checkPermissions().then(
        async (permisioncheck) => {
          console.log("permision", permisioncheck);
          if (permisioncheck.display === "granted") {
            return;
          }
          await LocalNotifications.requestPermissions();
        }
      );
    } catch (err:any) {
      throw new Error(err);
    }
  }

  async loadUsers() {
    this.Permission();
    this.userData = await this.databaseService.getUsers();
    // console.log(this.router.url);
    console.log("this is user data : ",this.userData);
    if (this.userData?.values.length > 0 ) {
      // console.log(this.router.url);
      this.router.navigateByUrl("view/users/signed/home");
    } else {
      this.router.navigateByUrl("view/users/login");
    }
  }

  async showLoading() {
    const loading = await this.loadingCtrl.create({
      spinner: "crescent",
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
