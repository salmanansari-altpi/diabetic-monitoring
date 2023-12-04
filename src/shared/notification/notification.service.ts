import { EventEmitter, Injectable } from '@angular/core';
import {
  LocalNotifications,
  Channel,
  ScheduleOptions,
} from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notificationClicked = new EventEmitter<void>();

  constructor() {
    LocalNotifications.addListener('localNotificationActionPerformed', () => {
      this.notificationClicked.emit();
    });
  }

  async showNotification(data: any) {
    const { id, title, body, eventName, date } = data;
    let dateObj = date;
    const channelOption: Channel = {
      id: 'diabetic',
      name: 'diabetic',
      sound: 'beep.wav',
      importance: 5,
      visibility: 1,
      lights: true,
    };
    await LocalNotifications.createChannel(channelOption);

    const options: ScheduleOptions = {
      notifications: [
        {
          id: id,
          title: title,
          body: body,
          schedule: {
            at: dateObj,
            every: 'day',
            count: 1,
            allowWhileIdle: true,
          },
          channelId: 'diabetic',
        },
      ],
    };

    try {
      return await LocalNotifications.schedule(options);
    } catch (err) {
      return console.log('notification service: ', err);
    }
  }

  async listAllChannels() {
    await LocalNotifications.listChannels();
  }
}
