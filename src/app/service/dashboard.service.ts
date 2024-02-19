import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { environment } from 'src/environments/environment';

const firebaseApp = initializeApp(environment.firebaseConfig);
const db = getFirestore(firebaseApp);

@Injectable({ providedIn: 'root' })
export class DashboardService {

    formGroup: FormGroup;

    constructor(private fb: FormBuilder) {
        this.formGroup = this.fb.group({
            date: new FormControl({value: '', disabled: true}, Validators.required),
            assignment: [],
            value: [],
            installment: [],
            card: [],
            description: [],
            category: [],
        })
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

    async getListCategories(userId: string): Promise<any[]> {
        try {
            const q = query(collection(db, 'users', userId, 'categories'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            throw error;
        }
    }

    async getListHolder(userId: string): Promise<any[]> {
        try {
          const q = query(collection(db, 'users', userId, 'holder'));
          const querySnapshot = await getDocs(q);
          return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          throw error;
        }
    }

    async getListDates(userId: string): Promise<any[]> {
      try {
        const q = query(collection(db, 'users', userId, 'dashboard'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        throw error;
      }
  }

    async addValuesCard(data: any, userId: string): Promise<void> {
      try {
        const categoriesCollection = collection(db, 'users', userId, 'dashboard');
        await addDoc(categoriesCollection, {
          date: data.date,
          assignment: data.assignment,
          value: data.value,
          installment: data.installment,
          card: data.card,
          description: data.description,
          category: data.category,
        });
      } catch (error) {
        throw error;
      }
    }

}
