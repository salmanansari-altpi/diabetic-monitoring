import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/shared/database/database.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
})
export class TransactionsPage implements OnInit {
  transactions: any;

  constructor(private db: DatabaseService) {}

  ngOnInit() {
    this.fetchTransactions();
  }

  async fetchTransactions() {
    const res = await this.db.getAllTransactions();
    console.log('res trans: ', res);

    this.transactions = res?.values;
    console.log('trans: ', this.transactions);
  }
}
