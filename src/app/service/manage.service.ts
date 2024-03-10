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
    const expensesCollectionRef = query(collection(db, 'users', filters.userId, 'dashboard'));
    console.log("expensesCollectionRef ", expensesCollectionRef )
    
    // Cria a consulta base a partir da coleção
    let q = query(expensesCollectionRef);
    
    // Aplicar filtro por mês se fornecido
    console.log("SERVICE: filters.month ", filters.month)
    if (filters.year !== '0' && filters.month !== '0') {
      // Se tanto o mês quanto o ano forem fornecidos, filtre por ambos
      const startDate = new Date(Number(filters.year), Number(filters.month) - 1, 1);
      const endDate = new Date(Number(filters.year), Number(filters.month), 0); // Último dia do mês

      q = query(q, where('date', '>=', startDate), where('date', '<=', endDate));
    }
    
    // Aplicar filtro por ano se fornecido (e se o mês não for especificado, para evitar conflito)
    console.log("SERVICE: filters.year && !filters.month ", filters.year)
    if (filters.year !== '0' && !filters.month) {
      const startYear = new Date(Number(filters.year), 0, 1); // Primeiro dia do ano
      const endYear = new Date(Number(filters.year), 11, 31); // Último dia do ano

      q = query(q, where('date', '>=', startYear), where('date', '<=', endYear));
    }

    // // Aplicar filtro por categoria se fornecido
    console.log("SERVICE: filters.category ", filters.category)
    if (filters.category) {
      q = query(q, where('category', '==', filters.category));
    }
    
    // Aplicar filtro por titular se fornecido
    console.log("SERVICE: filters.holder ", filters.holder)
    if (filters.holder) {
      q = query(q, where('assignment', '==', filters.holder));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
}


}
