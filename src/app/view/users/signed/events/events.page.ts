import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AnimationController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';
import { DatabaseService } from 'src/shared/database/database.service';
import { NotificationService } from "../../../../../shared/notification/notification.service";

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {
  // FORM VARIABLES
  customEventName: any;
  startRange: any;
  endRange: any;
  insuline: any;
  eventName: any;

  time: Date = new Date();
  showTime: Boolean = false;

  showData: Boolean = false;

  error: any;
  showError: Boolean = false;

  dropdownEvents: any;
  allEvents: any;

  constructor(
    private animationCtrl: AnimationController,
    private router: Router,
    private db: DatabaseService,
    private localNotification: NotificationService,
    private route: ActivatedRoute
  ) {
    this.eventName = 'Breakfast';
    this.fetchAllEventNames();
  }

  ngOnInit() {
    this.fetchAllEvents(this.eventName);
  }

  addCustomEvent() {
    this.db.createEventsList(this.customEventName);
    this.fetchAllEventNames();
    this.customEventName = '';
  }

  async fetchAllEventNames() {
    const { values: data }: any = await this.db.getEventsList();
    this.dropdownEvents = data;
    console.log('dropdown: ', this.dropdownEvents);
    this.eventName = '';
  }

  // SELECT EVENT
  event(data: any) {
    this.eventName = data.detail.value;
    this.fetchAllEvents(this.eventName);
    this.showError = false;
    this.showData = true;
  }

  selectTime(data: any) {
    this.time = new Date(data);
  }

  async addEvent(data: any) {
    const formData = {
      eventName: this.eventName,
      eventTime: this.time.toString(),
      startRange: this.startRange,
      endRange: this.endRange,
      dose: this.insuline,
    };

    const res: any = await this.db.addEvents(formData);
    if (res?.values) {
      this.showError = false;
      this.error = '';
    } else {
      this.error = res;
      this.showError = true;
    }

    this.fetchAllEvents(this.eventName);
    this.resetFormValue();
  }

  async fetchAllEvents(name: string) {
    this.allEvents = await this.db.getEvents(name);
    this.time = this.allEvents[0].eventTime;
  }

  // handling Next and setting the notification
  async handleNext() {
    await LocalNotifications.deleteChannel({ id: 'diabetic' });
    let pendingNoti = await LocalNotifications.getPending();
    console.log('all pending ', pendingNoti);
    if (pendingNoti.notifications.length > 0) {
      pendingNoti.notifications.forEach(async (notification) => {
        console.log('all pending noti for delete', notification);
        await LocalNotifications.cancel({ notifications: [notification] });
      });
    }

    let rid = 0;
    const { values: eventList }: any = await this.db.getEventsList();

    //forloop
    for (let i = 0; i < eventList.length; i++) {
      // if (eventList[i].eventName != 'Fixed') {
      rid += 1;
      let firstEvent: any = await this.db.getEvents(
        eventList[i].eventName
      );

      console.log('ddata', firstEvent);
      console.table(firstEvent?.values[0]);
      console.table(firstEvent?.values[1]);

      const date = new Date(firstEvent[0].eventTime);
      
      const data = {
        id: rid,
        title: firstEvent[0].eventName,
        body: firstEvent[0].eventName,
        eventName: firstEvent[0].eventName,
        date,
      };
      this.localNotification.showNotification(data);
    }
    this.router.navigateByUrl('view/users/signed/home');
  }

  resetFormValue() {
    this.startRange = '';
    this.endRange = '';
    this.insuline = '';
  }

  //modal Animation
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
}
