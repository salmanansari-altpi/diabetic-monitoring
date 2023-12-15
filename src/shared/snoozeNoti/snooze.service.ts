import { Injectable } from '@angular/core';
import {
  LocalNotifications,
  Channel,
  ScheduleOptions,
} from '@capacitor/local-notifications';
@Injectable({
  providedIn: 'root',
})
export class SnoozeService {
  channelId: string = 'diabetic';
  actionTypeId: string = 'chart_id';
  snoozeId: number[] = [101, 102, 103];
  count: number = 0;
  constructor() {}

  async mainSnoozeNoti(data: any) {
    // await this.cancelAlllisteners(data).then(
    //   async () => {
    await this.scheduleNoti(data);
    //   },
    //   (err) => {
    //     console.log(err);
    //   }
    // );
  }

  async cancelAlllisteners(data: any) {
    let { title, body } = data;
    if (this.count != 0) {
      let deletenoti = {
        notifications: [
          {
            id: this.snoozeId[this.count - 1],
            title,
            body,
          },
        ],
      };
      await LocalNotifications.removeDeliveredNotifications(deletenoti);
      // await LocalNotifications.removeAllListeners();
    }
  }

  async scheduleNoti(data: any) {
    const { id, title, body, date } = data;

    LocalNotifications.registerActionTypes({
      types: [
        {
          id: this.actionTypeId,
          actions: [
            { id: 'reject', title: 'Reject' },
            // { id: 'snooze', title: 'Snooze' },
          ],
        },
      ],
    });

    const options: ScheduleOptions = {
      notifications: [
        {
          // id: this.snoozeId[this.count],
          id,
          title,
          body,
          schedule: {
            at: new Date(date),
            on: { second: 15 },
            repeats: true,
            count: 1,
            allowWhileIdle: true,
          },
          // ongoing: true,
          autoCancel: true,
          channelId: this.channelId,
          actionTypeId: this.actionTypeId,
        },
      ],
    };
    await LocalNotifications.schedule(options);
  }
}
