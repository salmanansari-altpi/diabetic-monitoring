import { EventEmitter, Injectable } from "@angular/core";
import {
  LocalNotifications,
  Channel,
  ScheduleOptions,
} from "@capacitor/local-notifications";
import { DatabaseService } from "../database/database.service";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  channelId: string = "diabetic";
  constructor(private db: DatabaseService) {}

  async checkAllAndSchedule() {
    let channels: any = await LocalNotifications.listChannels();
    console.log(channels[0])
    if (channels[0]?.id === this.channelId) {
      this.deleteChannels(`${channels[0]?.id}`).then(async () => {
        await this.scheduleNoti();
      });
    } else {
      await this.scheduleNoti();
    }
  }

  async deleteChannels(channelId: string) {
    return await LocalNotifications.deleteChannel({ id: channelId });
  }
  async createChannels() {
    const channelOption: Channel = {
      id: this.channelId,
      name: "diabetic",
      sound: "beep.wav",
      importance: 5,
      visibility: 1,
      lights: true,
    };
    await LocalNotifications.createChannel(channelOption);
  }

  async scheduleNoti() {
    this.checksBeforeSchedule().then(async ()=>{
      let rid = 0;
      const { values: eventList }: any = await this.db.getEventsList();
      for (let i = 0; i < eventList.length; i++) {
        ++rid;
        const firstEvent: any = await this.db.getEvents(eventList[i].eventName);
        console.log("firstEvent: ", firstEvent);
        const date = new Date(firstEvent[0].eventTime);
        const data = {
          id: rid,
          title: firstEvent[0].eventName,
          body: firstEvent[0].eventName,
          eventName: firstEvent[0].eventName,
          date,
        };
        this.notification(data);
      }
    })

  }

  async checksBeforeSchedule(){
    await this.createChannels();
    await LocalNotifications.removeAllListeners();

    const pendingNoti = await LocalNotifications.getPending();
    console.log('pending noti:', pendingNoti);

    if (pendingNoti.notifications.length > 0) {
      pendingNoti.notifications.forEach(async (notification) => {
        await LocalNotifications.cancel({ notifications: [notification] });
      });
    }
  }

  async notification(data: any) {
    const { id, title, body, eventName, date } = data;
    let dateObj = date;

    const options: ScheduleOptions = {
      notifications: [
        {
          id: id,
          title: title,
          body: body,
          schedule: {
            at: dateObj,
            every: "day",
            count: 1,
            allowWhileIdle: true,
          },
          channelId: this.channelId,
        },
      ],
    };

    try {
      return await LocalNotifications.schedule(options);
    } catch (err) {
      return console.log("notification service: ", err);
    }
  }
}
