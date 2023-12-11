import { Component, OnInit } from '@angular/core';
import { Haptics } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AlertController } from '@ionic/angular';
import { DatabaseService } from 'src/shared/database/database.service';
import { NotificationService } from 'src/shared/notification/notification.service';
import { App } from '@capacitor/app';

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

  constructor(
    private alertController: AlertController,
    private db: DatabaseService,
    private localNotification: NotificationService
  ) {
    this.fetchUser();
  }

  async ngOnInit() {
    // CLICKED
    await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (noti: any) => {
        console.log(noti);
        this.eventName = noti.notification.title;
        this.deletelistener = false;
        console.log('the noti is click', this.deletelistener);
        await this.sugarAlertHandler();
      }
    );

    // RECIEVED
    await LocalNotifications.addListener(
      'localNotificationReceived',
      async (notification) => {
        Haptics.vibrate({ duration: 1000 });
        this.deletelistener = true;
        console.log('the noti is recevie ', this.deletelistener);

        const data = {
          eventName: notification.title,
          date: new Date().toString(),
        };
        await this.db.addTransaction(data);
      }
    ).then(() => {
      setTimeout(async () => {
        if (this.deletelistener === true) {
          console.log('after 2.5 seconds');
          await this.removeListener();
        }
      }, 2500);
    });

    this.getPendingNotifications();
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
      message: `You have to take ${this.insulin}.`,
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
      this.addTransaction();
    }
  }

  async addTransaction() {
    const data = {
      eventName: this.eventName,
      sugarLevel: this.sugarLevel,
      dose: this.insulin,
      date: new Date().toString(),
      action: 'Success',
    };
    console.log('data for update Transaction ', data);
    await this.db.updateTransaction(data);
    this.sugarLevel = 0;
    this.insulin = '';
  }

  async reScheduleNotification() {
    await this.localNotification.checkAllAndSchedule();
  }
}
