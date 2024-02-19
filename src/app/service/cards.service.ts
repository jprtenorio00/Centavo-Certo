import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { environment } from 'src/environments/environment';

const firebaseApp = initializeApp(environment.firebaseConfig);
const db = getFirestore(firebaseApp);

@Injectable({
  providedIn: 'root'
})
export class CardsService {

  formGroup: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
        bankIssuer: [''],
        typeCard: [''],
        cardDigits: [''],
        natureCard: [''],
    })
  }

  async addValuesCard(bankIssuer: String, typeCard: String, cardDigits: String, natureCard: String, userId: string): Promise<void> {
    try {
      const categoriesCollection = collection(db, 'users', userId, 'card');
      cardDigits = `.${cardDigits.replace(/\D/g, '')}`;
      await addDoc(categoriesCollection, {
        bank: bankIssuer,
        typeCard: typeCard,
        cardDigits: cardDigits,
        natureCard: natureCard,
      });
    } catch (error) {
      throw error;
    }
  }

  async getListCard(userId: string): Promise<any[]> {
    try {
      const q = query(collection(db, 'users', userId, 'card'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  }
  
  async deleteCard(userId: string, cardId: string): Promise<void> {
    try {
      const categoryDocRef = doc(db, 'users', userId, 'card', cardId);
      await deleteDoc(categoryDocRef);
    } catch (error) {
      throw error;
    }
  }

}
