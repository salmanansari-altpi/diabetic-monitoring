import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../shared/database/database.service';
import { Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  pName = '';
  pEmail = '';
  pMobile = '';
  pDOB: Date = new Date();
  dName = '';
  dEmail = '';
  dMobile = '';

  permision!: boolean;

  userExists: Boolean = false;

  constructor(private db: DatabaseService, private router: Router) {}

  ngOnInit() {
    // this.fetchUser();
    this.forNotiPermission();
  }

  // for permision
  async forNotiPermission() {
    try {
      await LocalNotifications.checkPermissions().then(
        async (permisioncheck) => {
          console.log('permision', permisioncheck);
          if (permisioncheck.display === 'granted') {
            return;
          }

          await LocalNotifications.requestPermissions();
        }
      );
    } catch (err: any) {
      throw new Error(err);
    }
  }
  async makePermission(data: string) {}

  async registerUser() {
    const formData = {
      pName: this.pName,
      pEmail: this.pEmail,
      pMobile: this.pMobile,
      pDOB: new Date().toString(),
      dName: this.dName,
      dEmail: this.dEmail,
      dMobile: this.dMobile,
    };

    await this.db
      .addUser(formData)
      .then((res) => console.log(res))
      .catch((err) => console.log(err.message));
    this.db.isLoggedIn = true;
    this.router.navigateByUrl('events');
  }
}
