import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirebaseAuth } from '@angular/fire';
import { isNullOrUndefined } from 'util';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class IdentityService {
  private _authObservable: Observable<firebase.User>
  private _authSubject: Subject<firebase.User>;
  private _auth: firebase.User;
  
  private _userObservable: {[email: string]: Observable<User>} = {};
  private _userSubject: {[email: string]: Subject<User>} = {};

  constructor(private _afDb: AngularFirestore, private _afAuth: AngularFireAuth) {
    this._authSubject = new ReplaySubject(1);
    // this._userSubject = new ReplaySubject(1);
  }

  public getFirebaseAuthState(): Observable<firebase.User> {
    if (isNullOrUndefined(this._authObservable)) {
      this._authObservable = this._afAuth.authState;
      this._authObservable.subscribe(auth => {
        this._authSubject.next(auth);
      });
    }

    return this._authSubject.asObservable();
  }

  public getUserData(email?: string): Observable<User> {
    if (isNullOrUndefined(email)) {
      email = this._auth.email;
    }

    if (isNullOrUndefined(this._userObservable[email])) {
      this._userObservable[email] = this._afDb
          .collection('Users')
          .doc(email)
          .snapshotChanges().pipe(map(snap => snap.payload.data() as User));
      this._userSubject[email] = new ReplaySubject(1);
      this._userObservable[email].subscribe(user => this._userSubject[email].next(user));
    }

    return this._userSubject[email].asObservable();
  }

  public registerIncompleteUser(email: string, data: any): Promise<any> {
    return this._afDb.collection('Users').doc(email).set(data, { merge: true });
  }

  public async finishRegisterIncompleteUser(userData: User): Promise<any> {
    const accountKey = this.b64EncodeUnicode(userData.email);
    await this._afDb.collection('Users').doc(userData.email).set(userData, { merge: true });
    return this._afAuth.auth.createUserWithEmailAndPassword(userData.email, userData.password);
  }

  public async isUserRegistered(userKey: String): Promise<boolean> {
    const email = this.b64DecodeUnicode(userKey);
    let userData = await this.getUserData(email).toPromise();
    
    if (isNullOrUndefined(userData.password)) {
      return false;
    }

    return true;
  }

  public LoginWithEmailAndPassword(email: string, password: string): Promise<any> {
    return this._afAuth.auth.signInWithEmailAndPassword(email, password)
        .then(authState => {
          
        })
  }



  public b64EncodeUnicode(str: any) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        // function toSolidBytes(match, p1) {
        (match, p1) => {
          // console.debug('match: ' + match);
          return String.fromCharCode(("0x" + p1) as any);
        }));
    }
    public b64DecodeUnicode(str) {
      // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(atob(str).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
      }
}