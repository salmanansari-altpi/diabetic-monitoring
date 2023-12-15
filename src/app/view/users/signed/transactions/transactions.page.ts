import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/shared/database/database.service';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {
  transactions: any;

  //variable
  yearTransactionHistory: any; // Transaction history of the all the users for the last year
  // ch id of the selected end user
  filteredTxnHistory: any; //transaction history that is being showed to the user

  selectMode: string = 'Today'; // Today | Week | Month | Year
  fromShowPicker: boolean = false;
  toShowPicker: boolean = false;
  startDate: any;
  endDate: any;

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    // this.fetchTransactions();
    this.setToday();
    // await this.listener();
  }

  // async fetchTransactions() {
  //   const res = await this.db.getAllTransactions();
  //   console.log('res trans: ', res);
  //   this.transactions = res?.values;
  //   console.log('trans: ', this.transactions);
  // }
  // transactionData(start: any = '', end: any = '') {
  //   let startDate: any = new Date();
  //   let endDate: any = new Date();
  //   let year = startDate.getFullYear();
  //   startDate.setFullYear(year - 1);
  //   startDate = start ? start : startDate;
  //   endDate = end ? end : endDate;
  //   startDate = format(startDate, 'yyyy-MM-dd');
  //   endDate = format(endDate, 'yyyy-MM-dd');
  //   const data = { startDate, endDate };
  //   console.log(startDate, endDate);
  // }

  dateForFilter(enteredFilter: any) {
    this.selectMode = enteredFilter.value;
    if (this.selectMode == 'Today') {
      this.setToday();
    } else if (this.selectMode == 'Week') {
      this.setWeek();
    } else if (this.selectMode == 'Month') {
      this.setMonth();
    } else if (this.selectMode == 'Year') {
      this.setYear();
    } else if (this.selectMode == 'Custom') {
      this.setCustom();
    }
  }

  setToday() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log('Today :', today);
    this.filter(today.toString());
  }
  setWeek() {
    let today = new Date();
    let week = today.getDate();
    today.setDate(week - 7);
    // let formWeek = format(today, 'yyyy-MM-dd') + 'T09:00:00.000Z';
    // this.fromDateFormattedString = format(parseISO(formWeek), 'yyyy-MM-dd');
    //this is filtering the data as per the date
    console.log('Week : ', today);
    this.filter(today.toString());
  }
  setMonth() {
    let today = new Date();
    let month = today.getMonth();
    today.setMonth(month - 1);
    // let formMonth = format(today, 'yyyy-MM-dd') + 'T09:00:00.000Z';
    // this.fromDateFormattedString = format(parseISO(formMonth), 'yyyy-MM-dd');
    //this is filtering the data as per the date
    console.log('month : ', today);
    this.filter(today.toString());
  }
  setYear() {
    let today = new Date();
    let year = today.getFullYear();
    today.setFullYear(year - 1);
    // let formYear = format(today, 'yyyy-MM-dd') + 'T09:00:00.000Z';
    // this.fromDateFormattedString = format(parseISO(formYear), 'yyyy-MM-dd');
    //this is filtering the data as per the date
    this.filter(today.toString());
  }

  setCustom() {
    let today = new Date();
    // this.toDateFormattedString = format(
    //   parseISO(format(today, 'yyyy-MM-dd') + 'T09:00:00.000Z'),
    //   'yyyy-MM-dd'
    // );
    this.endDate = new Date();
    let year = today.getFullYear();
    today.setFullYear(year - 1);
    this.startDate = today;
    console.log(' starting date of custom', this.startDate);
    // this.fromDateFormattedString = format(
    //   parseISO(format(today, 'yyyy-MM-dd') + 'T09:00:00.000Z'),
    //   'yyyy-MM-dd'
    // );
  }
  customFromDate(enteredDate: any) {
    console.log('From date enter (raw) ', enteredDate);
    this.startDate = new Date(enteredDate);
    // this.fromDateFormattedString = format(parseISO(enteredDate), 'yyyy-MM-dd');
    // console.log('From date enter (formatted) ', this.fromDateFormattedString);

    this.fromShowPicker = false;
  }
  customToDate(enteredDate: any) {
    console.log('To date enter (raw) ', enteredDate);
    this.endDate = new Date(enteredDate);
    // this.toDateFormattedString = format(parseISO(enteredDate), 'yyyy-MM-dd');
    // console.log('To date enter (formatted) ', this.toDateFormattedString);

    this.toShowPicker = false;
  }
  async applyCustom() {
    let startDate = this.startDate.toString();
    let endDate = this.endDate.toString();
    console.log('from date :', startDate);
    console.log('To date :', this.endDate);
    const data = {
      startDate,
      endDate,
    };
    const res = await this.db.getTransactions(data);
    this.transactions = res?.values?.reverse();
  }
  async filter(startDate: any) {
    let endDate = new Date().toString();

    let data = { startDate, endDate };

    const res = await this.db.getTransactions(data);
    console.log('res trans: ', res);

    this.transactions = res?.values?.reverse();
    console.log('trans: ', this.transactions);
  }

  //let try

  // async listener() {
  //   await LocalNotifications.addListener(
  //     'localNotificationActionPerformed',
  //     async (noti: any) => {
  //       console.log(' the listener is running in transaction');
  //     }
  //   );
  // }
}
