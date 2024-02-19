import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const firebaseApp = initializeApp(environment.firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  formGroup: FormGroup;

  constructor(private fb: FormBuilder) { 
    this.formGroup = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      plan: ['', Validators.required]
    })
  }

  async registerUser(email: string, password: string, userData: any): Promise<any> {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        if (result.user) {
            await setDoc(doc(db, 'users', result.user.uid), userData);
        }

        return result;
    } catch (error) {
        console.error("Error: ", error);
        throw error;
    }
  }
}