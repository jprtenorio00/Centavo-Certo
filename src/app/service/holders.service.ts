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
export class HoldersService {

  formGroup: FormGroup;

  constructor(private fb: FormBuilder) {
      this.formGroup = this.fb.group({
        fullName: [''],
        relation: [''],
      })
  }

  async addValuesHolder(fullName: String, relation: String, userId: string): Promise<void> {
    try {
      const categoriesCollection = collection(db, 'users', userId, 'holder');
      await addDoc(categoriesCollection, {
        name: fullName,
        relation: relation,
      });
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
  
  async deleteHolder(userId: string, holderId: string): Promise<void> {
    try {
      const categoryDocRef = doc(db, 'users', userId, 'holder', holderId);
      await deleteDoc(categoryDocRef);
    } catch (error) {
      throw error;
    }
  }

}
