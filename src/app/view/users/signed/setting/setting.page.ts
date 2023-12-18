import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AlertController, AnimationController } from '@ionic/angular';
import { DatabaseService } from 'src/shared/database/database.service';
import { NotificationService } from 'src/shared/notification/notification.service';
import { SnoozeService } from 'src/shared/snoozeNoti/snooze.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  editTime: Date = new Date();
  editStartRange: any;
  editEndRange: any;
  editEventId: any;
  editId: any;
  editEventName: any;
  insulin: any;

  error: any;
  showError: Boolean = false;
  showTime: Boolean = false;
  showEdit: Boolean = false;
  result: any;

  eventName: any;
  insulinAlert: any;
  sugarlvlAlert: any;
  transactionInsulin: any;
  sugarLevel: any;

  deleteData: any;

  constructor(
    private animationCtrl: AnimationController,
    private db: DatabaseService,
    private localNotification: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private snooze: SnoozeService,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    await LocalNotifications.removeAllListeners();
    await this.listener();
    this.fetchEvents();
  }

  selectTime(data: any) {
    this.editTime = new Date(data);
  }

  async fetchEvents() {
    // await this.listener();

    this.result = await this.db.getAllEvents();
    this.result = this.result[0]?.values.forEach(
      (item: any) => (item.eventTime = new Date(item?.eventTime))
    );
    console.log('All Events in Settings: ', this.result);
  }

  async toggleEditHandler(data: any) {
    this.editEventId = Number(data.id.el.id);
    const res = await this.db.getEventDetail(this.editEventId);
    console.log('setting res: ', res);

    this.editId = res.detail.values[0].id;
    this.editStartRange = res.detail.values[0].startRange;
    this.editEndRange = res.detail.values[0].endRange;
    this.insulin = res.detail.values[0].dose;
    this.editEventName = res.event.values[0].eventName;

    this.editTime = new Date(res.event.values[0].eventTime);
    this.showEdit = true;
  }

  async editHandler() {
    const data = {
      id: this.editId,
      eventId: this.editEventId,
      startRange: this.editStartRange,
      endRange: this.editEndRange,
      dose: this.insulin,
      eventTime: this.editTime,
    };
    const res = await this.db.updateEvents(data);
    if (res) {
      this.showError = true;
      this.error = res;
    } else {
      this.showError = false;
      this.error = '';
      this.showEdit = false;
      await this.updateNotification();
      this.fetchEvents();
      await LocalNotifications.removeAllListeners();
      await this.listener();
    }
  }

  async updateNotification() {
    await this.localNotification.checkAllAndSchedule();
  }

  async handleAddMoreEvent() {
    console.log('click back');
    await LocalNotifications.removeAllListeners();
    await LocalNotifications.removeAllDeliveredNotifications();
    this.router.navigateByUrl('view/users/signed/events');
  }

  // delete event
  deleteButton(data: any) {
    this.deleteData = data;
  }
  async deleteEvent() {
    console.log(this.deleteData);
    await this.db.deleteEvents(this.deleteData.eventName);
    await this.updateNotification();
    this.fetchEvents();
    await LocalNotifications.removeAllListeners();
    await this.listener();
  }

  // ANIMATION
  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '1', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(200)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

  // listener for popup and notification

  async removeListener() {
    console.log('removing listener in function of removeListener()');
    await LocalNotifications.removeAllDeliveredNotifications();
    await LocalNotifications.removeAllListeners();
    return;
  }

  async listener() {
    await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      async (noti: any) => {
        console.log(' the listener is running in setting page');
        console.log(noti);
        this.eventName = noti.notification.title;
        let date = noti.notification.schedule.at;

        if (noti.actionId == 'tap') {
          await LocalNotifications.cancel({
            notifications: [
              {
                id: 101,
              },
            ],
          });
          this.removeListener().then(async () => {
            await this.sugarAlertHandler();
            this.listener();
          });
        } else if (noti.actionId == '15') {
          let data = {
            id: 101,
            title: this.eventName,
            body: this.eventName,
            date: new Date(new Date().getTime() + 15 * 1000).toString(),
          };
          this.snooze.scheduleNoti(data);
        }

        //   else if (noti.actionId == '30') {
        //     let data ={
        //       id:102,
        //       title: this.eventName,
        //       body: this.eventName,
        //       date: new Date(new Date().getTime() + 30*1000).toString(),
        //     }
        //     this.snooze.scheduleNoti(data)
        // }
        else if (noti.actionId == 'reject') {
          let data = {
            eventName: noti.notification.title,
            date: new Date().toString(),
            sugarLevel: 1,
            dose: 1,
            action: 'Rejected',
          };
          console.log('rejected data from FE', data);

          LocalNotifications.cancel({
            notifications: [
              {
                id: 101,
              },
            ],
          });
          this.removeListener().then(async () => {
            this.db.addTransaction(data);
            this.listener();
          });
        }
      }
    );
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
    // await LocalNotifications.removeAllDeliveredNotifications();
    // await LocalNotifications.removeAllListeners();

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
      this.transactionInsulin = res.values[0].dose;
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
      message: `Insulin Intake ${this.transactionInsulin} Units.`,
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
      dose: this.transactionInsulin,
      date: new Date().toString(),
      action: 'Success',
    };
    console.log('data for update Transaction ', data);
    await this.db.addTransaction(data);
    this.sugarLevel = 0;
    this.transactionInsulin = '';
  }
}
