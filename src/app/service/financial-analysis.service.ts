import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const firebaseApp = initializeApp(environment.firebaseConfig);
const db = getFirestore(firebaseApp);

@Injectable({
  providedIn: 'root'
})

export class FinancialAnalysisService {

  formGroup: FormGroup;

  constructor(private fb: FormBuilder, private afAuth: AngularFireAuth) { 
    this.formGroup = this.fb.group({
      amount: [],
      type: [],
    })
  }

  async saveFinanceData(userId: string, data: any): Promise<void> {
    try {
        const userFinanceCollectionRef = collection(db, 'users', userId, 'financeData');
        
        await addDoc(userFinanceCollectionRef, data);
    } catch (error) {
        console.error("Error saving finance data: ", error);
        throw error;
    }
  }

  async getFinanceDataByUID(uid: string) {
    try {
        const financeDataCollectionRef = collection(db, 'users', uid, 'financeData');
        const querySnapshot = await getDocs(financeDataCollectionRef);

        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error("Erro ao obter dados financeiros:", error);
        throw error;
    }
  }

}