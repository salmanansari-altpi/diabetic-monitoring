import { Component, OnInit } from '@angular/core';
import { Haptics } from '@capacitor/haptics';
import {
  LocalNotifications,
  ScheduleOptions,
} from '@capacitor/local-notifications';
import { AlertController } from '@ionic/angular';
import { DatabaseService } from 'src/shared/database/database.service';
import { NotificationService } from 'src/shared/notification/notification.service';
import { App } from '@capacitor/app';
import { TimeoutConfig } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  username: any;
  eventName: any = 'Breakfast';
  insulin: any;
  sugarLevel: any;

  insulinAlert: any;
  sugarlvlAlert: any;

  allChannels: any;

  deletelistener: any;

  snoozeCount: number;

  setTimeOutId: number | undefined;

  constructor(
    private alertController: AlertController,
    private db: DatabaseService,
    private localNotification: NotificationService
  ) {
    this.fetchUser();
  }

  async ngOnInit() {
    // let id = setTimeout(() => {
    //   console.log("hii")
    // },200)
    // console.info("set time out id : ",id)

    // CLICKED
    await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (noti: any) => {
        console.log(noti);
        this.eventName = noti.notification.title;

        console.log('the noti is click', this.deletelistener);
        if (this.setTimeOutId != undefined) {
          clearTimeout(this.setTimeOutId);
          this.setTimeOutId = undefined;
        }
        await this.sugarAlertHandler().then(async () => {
          await this.removeListener();
        });
      }
    );

    // RECIEVED
    await LocalNotifications.addListener(
      'localNotificationReceived',
      async (notification) => {
        this.deletelistener = true;
        let data: object;

        console.log('the noti is recevie ', this.deletelistener);

        data = {
          flag: false,
        };

        await this.db.addTransaction(data).then(() => {
          this.setTimeOutId = Number(
            setTimeout(async () => {
              if (this.deletelistener === true) {
                console.log('after 20000 seconds');
                this.snoozeCount = this.snoozeCount + 1;
                await this.removeListener().then(
                  async () => await this.snoozeNoti(this.snoozeCount)
                );

                if (notification.id === 103) {
                  data = {
                    eventName: this.eventName,
                    sugarLevel: this.sugarLevel,
                    dose: this.insulin,
                    date: new Date().toString(),
                    action: 'Reject',
                    flag: true,
                  };
                  await this.db.addTransaction(data);
                }
              }
            }, 20000)
          );
        });
      }
    );

    // if(this.deletelistener === true){
    //   setTimeout(async () => {
    //     if (this.deletelistener === true) {
    //       console.log('after 2.5 seconds');
    //       await this.removeListener();
    //       this.deletelistener = false;
    //     }
    //   }, 2500);
    // }
    this.getPendingNotifications();
  }

  async snoozeNoti(data: number) {
    if (data === 1) {
      const options: ScheduleOptions = {
        notifications: [
          {
            id: 101,
            title: this.eventName,
            body: this.eventName,
            schedule: {
              // at: new Date(new Date().getTime() + 50000),
              at: new Date(new Date().getTime() + 2500),
              count: 1,
              allowWhileIdle: true,
            },
            channelId: 'diabetic',
          },
        ],
      };
      await LocalNotifications.schedule(options);
    } else if (data === 2) {
      const options: ScheduleOptions = {
        notifications: [
          {
            id: 102,
            title: this.eventName,
            body: this.eventName,
            schedule: {
              // at: new Date(new Date().getTime() + 100000),
              at: new Date(new Date().getTime() + 5000),
              count: 1,
              allowWhileIdle: true,
            },
            channelId: 'diabetic',
          },
        ],
      };
      await LocalNotifications.schedule(options);
    } else {
      const options: ScheduleOptions = {
        notifications: [
          {
            id: 103,
            title: this.eventName,
            body: this.eventName,
            schedule: {
              // at: new Date(new Date().getTime() + 1500000),
              at: new Date(new Date().getTime() + 10000),
              count: 1,
              allowWhileIdle: true,
            },
            channelId: 'diabetic',
          },
        ],
      };
      await LocalNotifications.schedule(options);
    }
    this.snoozeCount = 0;
  }

  async removeListener() {
    console.log('removing listener in function of removeListener()');
    await LocalNotifications.removeAllDeliveredNotifications();
    await LocalNotifications.removeAllListeners();
  }

  async fetchUser() {
    const res: any = await this.db.getUsers();
    this.username = res?.values[0].pName;
  }

  async getPendingNotifications() {
    const pendingNoti = await LocalNotifications.getPending();
    console.table(pendingNoti);

    if (pendingNoti.notifications.length === 0) {
      await LocalNotifications.deleteChannel({ id: 'diabetic' });
      this.getChannels();
      this.reScheduleNotification();
    }
  }

  async getChannels() {
    this.allChannels = await LocalNotifications.listChannels();
    console.log('All Channels: ', this.allChannels);
  }

  async createSugarAlert() {
    return await this.alertController.create({
      header: `It's ${this.eventName} time`,
      message: 'Please enter the sugarLevel.',
      inputs: [{ placeholder: '20', type: 'number', name: 'sugarlvl' }],
      buttons: [{ text: 'Ok', role: 'ok' }],
      animated: true,
    });
  }

  async sugarAlertHandler() {
    this.sugarlvlAlert = await this.createSugarAlert();
    await this.sugarlvlAlert.present();
    await LocalNotifications.removeAllDeliveredNotifications();
    await LocalNotifications.removeAllListeners();

    // Waiting for the alert to be dismissed
    const { role, data } = await this.sugarlvlAlert.onDidDismiss();
    console.log(data);

    // Handling the result
    if (role === 'ok') {
      this.sugarLevel = Number(data.values.sugarlvl);
      const res: any = await this.db.sendInsulin({
        sugarLevel: this.sugarLevel,
        eventName: this.eventName,
      });
      this.insulin = res.values[0].dose;
      data.values.sugarlvl = '';
      // await this.sugarlvlAlert.dismiss();
      this.insulinAlertHandler();
    } else {
      console.log('Alert dismissed without entering a value');
    }
  }

  async createInsulinAlert() {
    return await this.alertController.create({
      header: `According to your sugar level.`,
      message: `Insulin Intake ${this.insulin} Units.`,
      buttons: [{ text: 'Ok', role: 'ok' }],
      animated: true,
    });
  }

  async insulinAlertHandler() {
    this.insulinAlert = await this.createInsulinAlert();
    await this.insulinAlert.present();
    const { role, data } = await this.insulinAlert.onDidDismiss();
    console.log(data);

    if (role === 'ok') {
      let data = {
        eventName: this.eventName,
        sugarLevel: this.sugarLevel,
        dose: this.insulin,
        date: new Date().toString(),
        action: 'Success',
        flag: true,
      };
      this.addTransaction(data);
    }
    return;
  }

  async addTransaction(data: any) {
    console.log('data for update Transaction ', data);
    await this.db.addTransaction(data);
    this.sugarLevel = 0;
    this.insulin = '';
  }

  async reScheduleNotification() {
    await this.localNotification.checkAllAndSchedule();
  }
}
