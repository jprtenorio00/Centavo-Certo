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

export class CategoriesService {

  formGroup: FormGroup;

  constructor(private fb: FormBuilder) {
      this.formGroup = this.fb.group({
          category: [],
      })
  }

  async addCategory(categoryName: string, userId: string): Promise<void> {
    try {
      const categoriesCollection = collection(db, 'users', userId, 'categories');
      await addDoc(categoriesCollection, {
        category: categoryName
      });
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

  async updateCategory(userId: string, categoryId: string, newCategoryName: string): Promise<void> {
    try {
      const categoryDocRef = doc(db, 'users', userId, 'categories', categoryId);
      await updateDoc(categoryDocRef, { category: newCategoryName });
    } catch (error) {
      throw error;
    }
  }
  
  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    try {
      const categoryDocRef = doc(db, 'users', userId, 'categories', categoryId);
      await deleteDoc(categoryDocRef);
    } catch (error) {
      throw error;
    }
  }

}
