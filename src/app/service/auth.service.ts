import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup } from '@angular/forms';

const firebaseApp = initializeApp(environment.firebaseConfig);
const db = getFirestore(firebaseApp);

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInStatus = new BehaviorSubject<boolean>(false);
  formGroup: FormGroup;

  constructor(private afAuth: AngularFireAuth, private fb: FormBuilder){
    this.formGroup = this.fb.group({
      isLoggedIn: [false],
    })

    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.loggedInStatus.next(true);
      } else {
        this.loggedInStatus.next(false);
      }
    });
  }

  isUserLoggedIn(): Observable<boolean> {
    return this.loggedInStatus.asObservable();
  }

  getUserToken(): Promise<string | null> {
      return this.afAuth.currentUser.then(user => {
          if (user) {
              return user.getIdToken();
          } else {
              return null;
          }
      });
  }

  async getUserLoggedIn(){
    try {
        const user = await this.afAuth.currentUser;
        const uid = user?.uid;
        if (uid) {
            const userDoc = doc(db, 'users', uid);
            const userSnapshot = await getDoc(userDoc);
        
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                return userData; 
            } else {
                return "erro ao recuperar os dados do usuário";
            }
        } else {
            console.error("UID não está definido!");
            return "UID não está definido!";
        }
      } catch (error) {
        console.error("Erro ao buscar o nome do usuário:", error);
        return "Erro ao buscar o nome do usuário:";
      }
  }

  async getCurrentUserUID(){
    const user = await this.afAuth.currentUser;
    const uid = user?.uid;
    return uid;
  }

  clear(): void{
    this.loggedInStatus.next(false);
  }

}
