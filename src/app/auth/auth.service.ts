import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FacebookService, InitParams, LoginOptions, LoginResponse } from 'ngx-facebook';
import { GoogleApiService, GoogleAuthService } from 'ng-gapi';
import { TranslateService } from '@ngx-translate/core';
import GoogleUser = gapi.auth2.GoogleUser;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
@Injectable()
export class AuthService {

  private localStorageTokenName = 'jwtToken';
  private homepageUrl = '/newsfeed';

  constructor(
    private http: HttpClient,
    private toastrService: ToastrService,
    private router: Router,
    private facebookService: FacebookService,
    private googleApiService: GoogleApiService,
    private googleAuthService: GoogleAuthService,
    public translate: TranslateService
  ) {
    let initParams: InitParams = {
      appId: environment.facebookAppID,
      xfbml: true,
      version: 'v2.8'
    };

    facebookService.init(initParams);

    googleApiService.onLoad().subscribe(function () { });
  }

  setToken(token: any): void {
    if (token) {
      localStorage.setItem(this.localStorageTokenName, token);
    } else {
      localStorage.removeItem(this.localStorageTokenName);
    }
  }

  getToken(): string {
    return localStorage.getItem(this.localStorageTokenName);
  }

  signUp(user: any): Observable<any> {
    const self = this;
    return this.http.post<any>(environment.apiUrl + 'signUp', user).pipe(
      catchError(self.handleError('signUp', []))
    );
  }

  verifyEmail(id: any): Observable<any> {
    const self = this;
    return this.http.get<any>(environment.apiUrl + 'verifyEmail/' + id).pipe(
      catchError(self.handleError('verifyEmail', []))
    );
  }

  verifyChildEmail(id: any): Observable<any> {
    const self = this;
    return this.http.get<any>(environment.apiUrl + 'verifyChildEmail/' + id).pipe(
      catchError(self.handleError('verifyChildEmail', []))
    );
  }

  signIn(user: any): Observable<any> {
    const self = this;
    return this.http.post<any>(environment.apiUrl + 'signIn', user).pipe(
      catchError(self.handleError('signIn', []))
    );
  }

  signInWithFacebook() {
    const self = this;
    let loginOptions: LoginOptions = {
      scope: 'email'
    };

    this.facebookService.login(loginOptions)
      .then(function (res: LoginResponse) {
        self.authFacebook(res.authResponse).subscribe(function (res2) {
          if (res2.msg === 'Sign In Is Successful!') {
            self.setToken(res2.token);
            self.translate.get('AUTH.TOASTER.SIGN_IN_SUCCESSFULL').subscribe(
              function (translation) {
                self.toastrService.success(translation);
              }
            );
            self.redirectToHomePage();
          }
        });
      })
      .catch(this.handleError);
  }

  authFacebook(authResponse): Observable<any> {
    const self = this;
    return this.http.post<any>(environment.apiUrl + 'auth/facebook', authResponse).pipe(
      catchError(self.handleError('authFacebook', []))
    );
  }

  signInWithGoogle() {
    const self = this;
    this.googleAuthService.getAuth().subscribe(function (res) {
      res.signIn()
        .then(function (res2: GoogleUser) {
          let user = {
            'email': res2.getBasicProfile().getEmail(),
            'firstName': res2.getBasicProfile().getGivenName(),
            'googleId': res2.getBasicProfile().getId(),
            'imageUrl': res2.getBasicProfile().getImageUrl(),
            'lastName': res2.getBasicProfile().getFamilyName()
          };
          self.authGoogle(user).subscribe(function (res3) {
            if (res3.msg === 'Sign In Is Successful!') {
              self.setToken(res3.token);
              self.translate.get('AUTH.TOASTER.SIGN_IN_SUCCESSFULL').subscribe(
                function (translation) {
                  self.toastrService.success(translation);
                }
              );
              self.redirectToHomePage();
            }
          });
        })
        .catch(this.handleError);
    });
  }

  authGoogle(authResponse): Observable<any> {
    const self = this;
    return this.http.post<any>(environment.apiUrl + 'auth/google', authResponse).pipe(
      catchError(self.handleError('authGoogle', []))
    );
  }

  isSignedIn(): Observable<any> {
    const self = this;
    return this.http.get<any>(environment.apiUrl + 'isSignedIn');
  }

  signOut(): void {
    localStorage.removeItem(this.localStorageTokenName);
  }

  getUserData(userDataColumns: Array<string>): Observable<any> {
    const self = this;
    return this.http.post<any>(environment.apiUrl + 'userData', userDataColumns);
  }

  getAnotherUserData(userDataColumns: Array<string>, username: string): Observable<any> {
    const self = this;
    return this.http.post<any>(environment.apiUrl + 'userData/' + username, userDataColumns).pipe(
      catchError(self.handleError('getAnotherUserData', []))
    );
  }

  childSignUp(user: any): Observable<any> {
    const self = this;
    return this.http.post<any>(environment.apiUrl + 'childsignup', user).pipe(
      catchError(self.handleError('childsignup', []))
    );
  }

  forgotPassword(email): any {
    const self = this;
    return this.http.get<any>(environment.apiUrl + 'forgotPassword/' + email).pipe(
      catchError(self.handleError('forgotPassword', []))
    );
  }

  resetPassword(id, pws: any): Observable<any> {
    const self = this;
    return this.http.patch<any>(environment.apiUrl + 'forgotPassword/resetpassword/' + id, pws, httpOptions).pipe(
      catchError(self.handleError('resetPassword', []))
    );
  }
  modifyNotification(notificationId, username, isRead: boolean): any {
    let self = this;
    return this.http.patch(environment.apiUrl + 'modifyNotification/' + notificationId, { isRead: isRead }).pipe(
      catchError(self.handleError('modifyNotification', []))
    );
  }

  getTags(): any {
    return this.http.get(environment.apiUrl + 'tags/getTags', httpOptions);
  }


  public handleError<T>(operation = 'operation', result?: T) {
    const self = this;
    return function (error: any): Observable<T> {
      if (
        operation === 'signUp' ||
        operation === 'verifyEmail' ||
        operation === 'signIn' ||
        operation === 'authFacebook' ||
        operation === 'authGoogle' ||
        operation === 'childsignup' ||
        operation === 'verifyChildEmail' ||
        operation === 'forgotPassword' ||
        operation === 'resetPassword' ||
        operation === 'modifyNotification'
      ) {
        if (error.status === 0) {
          self.translate.get('AUTH.TOASTER.CONNECTION_ERROR').subscribe(
            function (translation) {
              self.toastrService.error(translation);
            });
        } else if (self.translate.currentLang === 'en') {
          self.toastrService.error(error.error.msg);
        } else {
          self.toastrService.error('حدث خطأ ما؛ حاول مرة أخرى لاحقًا');
        }
      }
      return of(result as T);
    };
  }

  isAuthenticated() {
    const self = this;
    this.isSignedIn().subscribe(function (res) {

    }, function (err) {
      if (err.status === 401) {
        self.router.navigateByUrl('/landing');
      }
    });
  }

  isNotAuthenticated() {
    const self = this;
    this.isSignedIn().subscribe(function (res) {

    }, function (err) {
      if (err.status === 403) {
        self.redirectToHomePage();
      }
    });
  }

  redirectToHomePage(): void {
    this.router.navigateByUrl(this.homepageUrl);
  }

}
