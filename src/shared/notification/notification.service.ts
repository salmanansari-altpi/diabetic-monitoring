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
  actionTypeId: string = 'chart_id';
  constructor(private db: DatabaseService) {}

  async checkAllAndSchedule() {
    let channels: any = await LocalNotifications.listChannels();
    console.log(channels.channels[0])
    if (channels.channels[0].id === this.channelId) {
      console.log("deleting channel")
      this.deleteChannels(`${channels.channels[0].id}`).then(async () => {
        await this.scheduleNoti();
      });
    } else {
      console.log("without deleting channel")
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
    console.log("created channel")
    await LocalNotifications.createChannel(channelOption);
   
  }

  async scheduleNoti() {
    console.log("Scheduling noti")
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
        await this.notification(data);
      }
    })

  }

  async checksBeforeSchedule(){
    console.log("removeing all listner and change")
    await LocalNotifications.removeAllListeners();
    await LocalNotifications.removeAllDeliveredNotifications()
    await this.createChannels();

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

    LocalNotifications.registerActionTypes({
      types: [
        {
          id: this.actionTypeId,
          actions: [
            { id: 'reject', title: 'Reject' },
            { id: '15', title: 'Snooze' },
            // { id: '30', title: 'Snooze 30min' },
          ],
        },
      ],
    });

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
          ongoing:true,
          // autoCancel: true,
          actionTypeId: this.actionTypeId,
          channelId: this.channelId,
        },
      ],
    };
    await LocalNotifications.schedule(options);
  }
}
