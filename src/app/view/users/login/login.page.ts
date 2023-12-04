import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';
import { DatabaseService } from 'src/shared/database/database.service';

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

  constructor(
    private db: DatabaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

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

  registerUser() {
    const formData = {
      pName: this.pName,
      pEmail: this.pEmail,
      pMobile: this.pMobile,
      pDOB: new Date().toString(),
      dName: this.dName,
      dEmail: this.dEmail,
      dMobile: this.dMobile,
    };

    this.db
      .addUser(formData)
      .then((res: any) => {
        console.log("the login form submitted");
        this.router.navigate(['/view/users/signed']);
      })
      .catch((err: any) => console.log(err.message));
    // this.db.isLoggedIn = true;
    // this.router.navigate(['events']);
    // this.router.navigate(['view/users/events']);
    // this.router.events.subscribe((event) => {
    //   console.log(event);
    // });
  }
}
