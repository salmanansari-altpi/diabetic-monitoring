import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/shared/database/database.service';

@Component({
  selector: 'app-signed',
  templateUrl: './signed.page.html',
  styleUrls: ['./signed.page.scss'],
})
export class SignedPage implements OnInit {
  constructor(private db: DatabaseService, private router: Router) {}

  ngOnInit() {
    console.log('signed page');
    this.eventsData();
  }

  async eventsData() {
    let event: any = await this.db.getEventsList();
    console.log(event)
    if (event?.values.length > 0) {
      this.router.navigateByUrl('view/users/signed/home');
    } else {
      this.db
        .run()
        .then(() => this.router.navigateByUrl('view/users/signed/events'))
        .catch((err) => console.log(err));
    }
  }
}



