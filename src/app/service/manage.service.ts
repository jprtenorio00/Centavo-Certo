import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { environment } from 'src/environments/environment';

const firebaseApp = initializeApp(environment.firebaseConfig);
const db = getFirestore(firebaseApp);

@Injectable({ providedIn: 'root' })
export class ManageService {

    formGroup: FormGroup;

    constructor(private fb: FormBuilder) {
        this.formGroup = this.fb.group({
            date: [],
            assignment: [],
            value: [],
            installment: [],
            card: [],
            description: [],
            category: [],
        })
    }

  async listExpenses(userId: string): Promise<any[]> {
    try {
      const q = query(collection(db, 'users', userId, 'dashboard'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  }

  async updateExpense(userId: string, expenseId: string, newData: any): Promise<void> {
    try {
      const expenseRef = doc(db, 'users', userId, 'dashboard', expenseId);
      await updateDoc(expenseRef, newData);
    } catch (error) {
      throw error;
    }
  }

  async deleteExpense(userId: string, expenseId: string): Promise<void> {
    try {
      const expenseRef = doc(db, 'users', userId, 'dashboard', expenseId);
      await deleteDoc(expenseRef);
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

async listFilteredExpenses(filters: { userId: string, month?: string, year?: string, category?: string, holder?: string }): Promise<any[]> {
  try {
    const expensesCollectionRef = collection(db, 'users', filters.userId, 'dashboard');
    
    // Inicia a query base
    let q = query(expensesCollectionRef);

    // Aplica filtro por mês, se fornecido
    if (filters.month && filters.month !== '') {
      // Como 'month' agora é um campo separado, você pode filtrar diretamente por ele
      q = query(q, where('month', '==', filters.month));
    }
    
    // Aplica filtro por ano, se fornecido
    if (filters.year && filters.year !== '0') {
      // Similarmente, 'year' é um campo separado e pode ser usado diretamente no filtro
      q = query(q, where('year', '==', String(filters.year)));
    }

    // Aplica filtro por categoria, se fornecido
    if (filters.category && filters.category !== '') {
      q = query(q, where('category', '==', filters.category));
    }
    
    // Aplica filtro por titular, se fornecido
    if (filters.holder && filters.holder !== '') {
      q = query(q, where('assignment', '==', filters.holder));
    }

    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
}



}
