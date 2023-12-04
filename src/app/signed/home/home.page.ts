import { Component, OnInit } from '@angular/core';
import { Haptics } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AlertController } from '@ionic/angular';
import { DatabaseService } from 'src/shared/database/database.service';
import { NotificationService } from 'src/shared/notification/notification.service';

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

  alertIsOpen: Boolean = false;

  constructor(
    private alertController: AlertController,
    private db: DatabaseService,
    private localNotification: NotificationService
  ) {}

  async ngOnInit() {
    // CLICKED
    LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (notification) => {
        this.sugarAlertHandler();
      }
    );

    // RECIEVED
    LocalNotifications.addListener(
      'localNotificationReceived',
      (notification) => {
        Haptics.vibrate({ duration: 1000 });
        this.eventName = notification.title;
        this.sugarAlertHandler();
        this.getPendingNotifications();
      }
    );

    this.getPendingNotifications();
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
      subHeader: 'A Sub Header Is Optional',
      message: 'A message should be a short, complete sentence.',
      inputs: [{ placeholder: 'Ex: 120', type: 'number', name: 'sugarlvl' }],
      buttons: [{ text: 'Ok', role: 'ok' }],
      animated: true,
    });
  }

  async sugarAlertHandler() {
    this.sugarlvlAlert = await this.createSugarAlert();
    if (!this.alertIsOpen) {
      await this.sugarlvlAlert.present();
    }

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
      this.alertIsOpen = false;
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
      action: 'success',
    };
    console.log('data for update Transaction ', data);
    await this.db.addTransaction(data);
    this.sugarLevel = 0;
  }

  async reScheduleNotification() {
    let rid = 0;

    const { values: eventList }: any = await this.db.getEventsList();

    for (let i = 0; i < eventList.length; i++) {
      rid += 1;
      const firstEvent: any = await this.db.getEvents(eventList[1].eventName);
      console.log('ddata: ', firstEvent);

      const date = new Date(firstEvent[0].eventTime);

      const data = {
        id: rid,
        title: firstEvent[0].eventName,
        body: firstEvent[0].eventName,
        eventName: firstEvent[0].eventName,
        date: date,
      };
      await this.localNotification.showNotification(data);
    }
  }
}
