import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AnimationController } from '@ionic/angular';
import { DatabaseService } from 'src/shared/database/database.service';
import { NotificationService } from 'src/shared/notification/notification.service';

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

  constructor(
    private animationCtrl: AnimationController,
    private db: DatabaseService,
    private localNotification: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.fetchEvents();
  }

  selectTime(data: any) {
    this.editTime = new Date(data);
  }

  async fetchEvents() {
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
      this.updateNotification();
      this.fetchEvents();
    }
  }

  async updateNotification() {
    await this.localNotification.checkAllAndSchedule();
  }

  handleAddMoreEvent() {
    console.log("click back");
    // this.router.navigate(['../../events'], {
    //   relativeTo: this.route.parent,
    // }).then(success => {
    //   console.log(`Navigation status: ${success}`);
    //   console.log('this is route of the event page :', this.router.url);
    //  });
    this.router.navigateByUrl("view/users/signed/events")
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
}
