import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { LoadingController } from "@ionic/angular";
import { DatabaseService } from "src/shared/database/database.service";
import { NotificationService } from "src/shared/notification/notification.service";

@Component({
  selector: "app-view",
  templateUrl: "./view.page.html",
  styleUrls: ["./view.page.scss"],
})
export class ViewPage implements OnInit {
  constructor(
    private notiService: NotificationService,
    private db: DatabaseService,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {}

  async ngOnInit() {
    console.log("view page initialized");
    await this.loadRun()
  }

  async loadRun() {
    let loading = await this.loadingCtrl.create({
      spinner: "crescent",
      message: "Wait a Sec",
      duration: 1000,
    });
    loading.present();
    // loading.present().then(async () => {
      // await this.db.run();
      // await this.recreatingNoti();
    // });
  }

  // async recreatingNoti() {
  //   await this.notiService.checkAllAndSchedule();
  // }
}
