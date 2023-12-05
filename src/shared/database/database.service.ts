import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private db: SQLiteDBConnection | null = null;
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  isLoggedIn: boolean = false;

  constructor() {
    console.log('DataBase');
    if (!this.db) {
      this.initializeDatabase();
    }
  }

  async initializeDatabase() {
    this.db = (await this.sqlite.createConnection(
      'myuserdb',
      false,
      'no-encryption',
      1,
      false
    )) as unknown as SQLiteDBConnection;

    await this.db.open();
    this.createTables();
  }

  async createTables() {
    if (this.db) {
      await this.db.execute(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pName STRING NOT NULL,
        pDOB STRING NOT NULL,
        pEmail STRING NOT NULL,
        pMobile STRING NOT NULL,
        dName STRING NOT NULL,
        dEmail STRING NOT NULL,
        dMobile STRING NOT NULL
      )`);

      await this.db.query(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        eventName TEXT UNIQUE,
        eventTime STRING
      )`);

      await this.db.execute(`CREATE TABLE IF NOT EXISTS eventMasters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        startRange INTEGER,
        endRange INTEGER,
        eventId INTEGER,
        dose INTEGER
      )`);

      await this.db.query(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        eventName STRING,
        sugarLevel INTEGER,
        dose INTEGER,
        action STRING,
        date STRING
      )`);
    }

  }
  run = async () => {
    const { values: events }: any = await this.getEventsList();
    console.log('kjgdfskjhkdjhkhdlshn', events);

    if (events.length >= 1) return;

    const date = new Date();
    await this.db?.query(
      `INSERT INTO events (eventName, eventTime) VALUES (?, ?)`,
      ['Breakfast', date.toString()]
    );
    await this.db?.query(
      `INSERT INTO events (eventName, eventTime) VALUES(?,?) `,
      ['Lunch', date.toString()]
    );
    await this.db?.query(
      `INSERT INTO events (eventName, eventTime) VALUES (?,?)`,
      ['Dinner', date.toString()]
    );
  };

  // ------------ USER -------------
  async getUsers() {
    return await this.db?.query('SELECT * FROM users');
  }

  async addUser(data: any) {
    try {
      const { pName, pEmail, pMobile, pDOB, dName, dEmail, dMobile } = data;
      if (
        !pName ||
        !pEmail ||
        !pMobile ||
        !pDOB ||
        !dName ||
        !dEmail ||
        !dMobile
      ) {
        throw new Error('All fields are mandatory!');
      }
      await this.db?.query(
        'INSERT INTO users (pName, pEmail, pMobile, pDOB, dName, dEmail, dMobile) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [pName, pEmail, pMobile, pDOB, dName, dEmail, dMobile]
      );
      const user = await this.getUsers();
      return user;
    } catch (err) {
      throw new Error('Something went wrong Add User: ' + err);
    }
  }

  // ------------- EVENTS List ------------------
  async getEventsList() {
    try {
      const eventList = await this.db?.query('SELECT * FROM events');
      console.log('backend all eventslist', eventList);

      return eventList;
    } catch (err) {
      throw new Error('Something went wrong Get Events Lists: ' + err);
    }
  }

  async createEventsList(eventName: string) {
    let date = new Date();
    try {
      if (!eventName) {
        throw new Error('EventName is mandatory!');
      }
      const date = new Date().toString();
      return await this.db?.query(
        'INSERT INTO events (eventName, eventTime) VALUES (?, ?)',
        [eventName, date]
      );
    } catch (err) {
      throw new Error('Something went wrong Get Events Lists: ' + err);
    }
  }

  // -------------- EVENT-MASTER ---------------
  async getEvents(eventName: string) {
    try {
      const { values: event }: any = await this.db?.query(
        'SELECT * FROM events WHERE eventName = ?',
        [eventName]
      );

      const eventInfo = {
        id: event[0].id,
        eventName: event[0].eventName,
        eventTime: event[0].eventTime,
      };

      const events = await this.db?.query(
        'select * from eventMasters WHERE eventId = ?',
        [event[0].id]
      );

      return [eventInfo, events];
    } catch (err) {
      throw new Error('Something went wrong load sugar ranges: ' + err);
    }
  }

  async getAllEvents() {
    try {
      const { values: event }: any = await this.db?.query(
        'SELECT * FROM events'
      );

      const allEventsInfo = event.map((cur: any) => {
        return {
          eventId: cur.id,
          eventName: cur.eventName,
          eventTime: cur.eventTime,
        };
      });
      const { values: events }: any = await this.db?.query(
        'select * from eventMasters'
      );

      return [allEventsInfo, events];
    } catch (err) {
      throw new Error('Something went wrong load sugar ranges: ' + err);
    }
  }

  async sendInsulin(data: any) {
    try {
      const { eventName, sugarLevel } = data;
      console.log('sendinsulin data :', data);
      const { values: res }: any = await this.db?.query(
        'SELECT id from events WHERE eventName = ?',
        [eventName]
      );
      console.log('back send-insulin', res);

      const dose = await this.db?.query(
        'SELECT dose FROM eventMasters WHERE eventId = ? AND startRange <= ? AND endRange >= ?',
        [res[0].id, sugarLevel, sugarLevel]
      );
      console.log('back send-insul dose', dose);

      return dose;
    } catch (err) {
      throw new Error('Something went wrong load sugar ranges: ' + err);
    }
  }

  async addEvents(data: any) {
    try {
      const { eventName, eventTime, startRange, endRange, dose } = data;
      if (
        eventName.trim() == '' ||
        eventTime.trim() == '' ||
        !startRange ||
        !endRange ||
        !dose
      ) {
        throw new Error('All fields are mandatory!');
      }

      const { values: eventId }: any = await this.db?.query(
        'SELECT id FROM events WHERE eventName = ?',
        [eventName]
      );

      const events: any = await this.db?.query(
        'SELECT * FROM eventMasters WHERE eventId = ?',
        [eventId[0].id]
      );

      const event: any = await this.db?.query(
        'SELECT * FROM events WHERE id = ?',
        [eventId]
      );

      if (events?.values.length < 1 && startRange < endRange) {
        const newEvent = await this.db?.query(
          'INSERT INTO eventMasters (eventId, startRange, endRange, dose) VALUES (?, ?, ?, ?)',
          [eventId[0].id, startRange, endRange, dose]
        );
        await this.db?.query('UPDATE events SET eventTime = ? WHERE id = ?', [
          eventTime,
          eventId[0].id,
        ]);

        return newEvent;
      }
      const ranges: any = events?.values?.map((event: any) => ({
        sRange: event.startRange,
        eRange: event.endRange,
      }));
      if (
        ranges[ranges?.length - 1].eRange >= startRange &&
        startRange < endRange
      ) {
        throw new Error(
          'StartRange and EndRange should be greater than below ranges.'
        );
      }
      const newEvent = await this.db?.query(
        'INSERT INTO eventMasters (eventId,  startRange, endRange, dose) VALUES (?, ?, ?, ?)',
        [eventId[0].id, startRange, endRange, dose]
      );
      console.log('second backend', newEvent);
      return newEvent;
    } catch (err: any) {
      console.log('add Events: ', err.message);
      return err.message;
    }
  }

  async getEventDetail(id: any) {
    try {
      console.log('bc: ', id);

      const detail: any = await this.db?.query(
        'SELECT * FROM eventMasters WHERE id = ?',
        [id]
      );
      const event: any = await this.db?.query(
        'SELECT * FROM events WHERE id = ?',
        [detail?.values[0].eventId]
      );
      if (!detail) {
        throw new Error('Something went wrong while getting detail');
      }
      if (!event) {
        throw new Error('Something went wrong while getting event');
      }
      console.log('bc1: ', detail);
      console.log('bc2: ', event);
      return { detail, event };
    } catch (err) {
      throw new Error('Something went wrong Get events: ' + err);
    }
  }

  async updateEvents(data: any) {
    try {
      let { id, eventId, startRange, endRange, dose, eventTime } = data;
      startRange = +startRange;
      endRange = +endRange;
      dose = +dose;
      if (!startRange || !endRange || !dose || !eventTime) {
        throw new Error('All fields are mandatory!');
      }

      console.log(data);

      if (startRange > endRange) {
        throw new Error('StartRange should be smaller than endRange!');
      }

      // GETTING STORED CURRENT VALUE
      const { values: currentEl }: any = await this.db?.query(
        'SELECT * FROM eventMasters WHERE id = ?',
        [id]
      );

      // UPPER
      await this.db?.query(
        'UPDATE eventMasters SET endRange = ? WHERE eventId = ? AND endRange = ?',
        [startRange - 1, eventId, currentEl[0].startRange - 1]
      );

      // Bottom
      await this.db?.query(
        'UPDATE eventMasters SET startRange = ? WHERE eventId = ? AND startRange = ?',
        [endRange + 1, eventId, currentEl[0].endRange + 1]
      );

      // CURRENT
      await this.db?.query(
        'UPDATE eventMasters SET startRange = ?, endRange = ?, dose = ? WHERE id = ?',
        [startRange, endRange, dose, id]
      );
      if (eventTime) {
        const { values: eventMaster }: any = await this.db?.query(
          'SELECT eventId FROM eventMasters WHERE id = ?',
          [id]
        );
        console.log('kjsdkj', eventMaster);

        await this.db?.query('UPDATE events SET eventTime = ? WHERE id = ?', [
          eventTime,
          eventMaster[0].eventId,
        ]);
      }
      return;
    } catch (err: any) {
      console.log('Something went wrong Update events: ' + err.message);
      return err.message;
    }
  }

  // ---------------- TRANSACTION ----------------------
  async getAllTransactions() {
    try {
      const res = await this.db?.query('SELECT * FROM transactions');
      console.log('backen trans:', res);
      return res;
    } catch (err) {
      throw new Error('Something went wrong in get transaction: ' + err);
    }
  }

  async getTransactions(data: any) {
    const { date } = data;
    try {
      return await this.db?.query('SELECT * FROM transactions WHERE date = ?', [
        date,
      ]);
    } catch (err) {
      throw new Error('Something went wrong Getting Transaction' + err);
    }
  }

  async addTransaction(data: any) {
    try {
      const { eventName, sugarLevel, action, date, dose } = data;
      if (!eventName || !date || !sugarLevel || !action || !dose) {
        throw new Error('All fields are mandatory!');
      }
      const transaction = await this.db?.query(
        'INSERT INTO transactions (eventName, sugarLevel, action, date, dose) VALUES ( ?, ?, ?, ?, ?)',
        [eventName, sugarLevel, action, date, dose]
      );
      console.log('transactions hass been added with this detail : ', data);
      return transaction;
    } catch (err) {
      throw new Error('Something went wrong add transaction' + err);
    }
  }

  async updateTransaction(data: any) {
    try {
      const { sugarLevel, action, dose, date } = data;
      if (!sugarLevel || !action || !dose || !date) {
        throw new Error('All fields are mandatory!');
      }
      const { values: transactions }: any = await this.db?.query(
        'SELECT id FROM transactions'
      );
      const lastId = transactions[transactions.length - 1].id;

      const transaction = await this.db?.query(
        'UPDATE transactions SET sugarLevel = ?,  action = ?, date = ?,  dose = ?) WHERE id = ?',
        [sugarLevel, action, date, dose, lastId]
      );
    } catch (err) {
      throw new Error('Something went wrong add transaction' + err);
    }
  }
}
