import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/service/auth.service';
import { LoadingService } from 'src/app/service/loading.service';
import { ManageService } from 'src/app/service/manage.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  listExpenses: Array<any> = [];
  listCards: Array<any> = [];
  listAssignment: Array<any> = [];
  listCategory: Array<any> = [];
  loading$ = this.loadingService.loading$;
  currentUserID: string | undefined = ''

  legendPos: any = 'below'
  colorScheme: any = {
    domain: ['#37447E', '#929ECC', '#6F7CB2', '#505F98', '#111B47']
  };

  constructor(private service: ManageService,
              private authService: AuthService,
              public loadingService: LoadingService,
              public dialog: MatDialog) { }

ngOnInit() {
  setTimeout(() => {
    this.getUserId();
  }, 1000);
}


async getUserId(){
  try {
    this.currentUserID = await this.authService.getCurrentUserUID();
    setTimeout(() => {
      this.getListExpenses();
    }, 800);
  } catch (error) {
    console.error("Erro ao recuperar o usuário " + error);
  }
}

async getListExpenses(){
  this.loadingService.show();
  try
  {
    const currentUserUID = this.currentUserID;
    if(currentUserUID)
    {
      this.listExpenses = await this.service.listExpenses(currentUserUID);
      this.convertDate(this.listExpenses)
    }
  }
  catch(error)
  {
    console.error('Erro ao carregar a lista de dados', error);
  } finally {
    setTimeout(() => {
      this.loadingService.hide();
    }, 500);
  }
}

convertDate(data: Array<any>) {
  this.listExpenses = data.map(d => ({
    ...d,
    date: d.date && d.date.seconds ? new Date(d.date.seconds * 1000).toLocaleDateString('pt-BR') : d.date
  }));
}


async updateExpense(expenseId: string, newData: any) {
  try {
    const currentUserUID = await this.authService.getCurrentUserUID();
    if (currentUserUID) {
      await this.service.updateExpense(currentUserUID, expenseId, newData);
      this.getListExpenses();
    }
  } catch (error) {
    console.error('Erro ao atualizar despesa:', error);
  }
}

async enableEditing(item: any, isEditing: boolean) {
  item.editing = isEditing;
  item.date = this.convertDateToISO(item.date); // Converte para formato ISO
  this.getAllLists();

  if (!isEditing) {
    // Executar ações necessárias para 'Cancelar alteração'
    await this.getListExpenses();
    item.date = this.convertDateToBRFormat(item.date);
    item.editing = false;
  }
}

getAllLists(){
  setTimeout(() => {
    this.getListCards();
    this.getListCategory();
    this.getListHolders();
  }, 800);
}

async getListCards(){
  try {
    const currentUserUID = this.currentUserID;
    if (currentUserUID) {
      this.listCards = await this.service.getListCard(currentUserUID);
      this.listCards = this.listCards.filter(item => !Array.isArray(item.bank)).sort((a, b) => a.bank.localeCompare(b.bank));
    }
  } catch (error) {
    console.error('Erro ao carregar os cartões:', error);
  }
}

async getListCategory(){
  try {
    const currentUserUID = this.currentUserID;
    if (currentUserUID) {
      this.listCategory = await this.service.getListCategories(currentUserUID);
      this.listCategory = this.listCategory.filter(item => !Array.isArray(item.category)).sort((a, b) => a.category.localeCompare(b.category));
    }
  } catch (error) {
    console.error('Erro ao carregar os categorias:', error);
  }
}


async getListHolders(){
  try {
    const currentUserUID = this.currentUserID;
    if (currentUserUID) {
      this.listAssignment = await this.service.getListHolder(currentUserUID);
      this.listAssignment = this.listAssignment.filter(item => !Array.isArray(item.name)).sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch (error) {
    console.error('Erro ao carregar os titulares:', error);
  }
}

updateItem(item: any): void {

  // Implemente a lógica para atualizar o item
    item.editing = false;
    item.date = this.convertDateToBRFormat(item.date); // Converte de volta para o formato BR

  const expenseId = item.id;
  const updatedExpenseData = {
    date: item.date,
    value: item.value,
    assignment: item.assignment,
    installment: item.installment,
    card: item.card,
    description: item.description,
    category: item.category
  }

  ;

  this.updateExpense(expenseId, updatedExpenseData)
    .then(() => {
      // Código a ser executado após a atualização bem-sucedida
      item.editing = false; // Desabilitar o modo de edição
    })
    .catch((error) => {
      // Tratamento de erro
      console.error('Erro ao atualizar despesa:', error);
    });
}

// Função para converter data de 'DD/MM/YYYY' para 'yyyy-MM-dd'
convertDateToISO(dateStr: string): string {
  // Verifica se a data está no formato 'yyyy-MM-dd'
  const isoFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (isoFormatRegex.test(dateStr)) {
    return dateStr; // Retorna a data como está, pois já está no formato ISO
  }

  // Processa datas no formato 'DD/MM/YYYY'
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }

  console.error('Formato de data inválido:', dateStr);
  return dateStr; // ou retorna um valor padrão ou erro
}

// Função para converter data de 'yyyy-MM-dd' para 'DD/MM/YYYY'
convertDateToBRFormat(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}


async deleteExpense(expenseId: string) {
  this.loadingService.show();
  try {
    const currentUserUID = await this.authService.getCurrentUserUID();
    if (currentUserUID) {
      await this.service.deleteExpense(currentUserUID, expenseId);
      this.getListExpenses();
    }
  } catch (error) {
    console.error('Erro ao excluir despesa:', error);
  } finally {
    setTimeout(() => {
      this.loadingService.hide();
    }, 500);
  }
}

openConfirmDialog(expenseId: string): void {
  document.body.classList.add('no-visibility');
  const dialogRef = this.dialog.open(ConfirmDialogComponent);

  dialogRef.afterClosed().subscribe(async result => {
    document.body.classList.remove('no-visibility');
    if(result) {
      await this.deleteExpense(expenseId);
    }
  });
}


}
