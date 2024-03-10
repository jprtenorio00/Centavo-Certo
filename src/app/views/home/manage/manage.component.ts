import * as XLSX from 'xlsx';
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
  isLoading: boolean = true;
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

  selectedMonth: string = '';
  selectedYear: string = '0';
  selectedCategory: string = '';
  selectedHolder: string = '';

  years: number[] = [];

  isFilterButtonDisabled: boolean = true; // Começa como true para o botão iniciar desabilitado

  constructor(private service: ManageService,
              private authService: AuthService,
              public loadingService: LoadingService,
              public dialog: MatDialog) { }

  ngOnInit() {
    setTimeout(() => {
      this.getUserId();
      // this.generateYears();
    }, 1000);
  }

  // generateYears() {
  //   const currentYear = new Date().getFullYear();
  //   this.years = Array.from({ length: 21 }, (v, i) => String(currentYear - i)); // converte os anos em strings
  // }

  onMatSelectOpen(opened: boolean) {
    if (opened) {
      this.getListCategory();
      this.getListHolders();
    }
  }

  // Função para aplicar os filtros
  applyFilters(): void {

    if (this.selectedMonth && (this.selectedYear === '0' || !this.selectedYear)) {
      // Exibe uma mensagem de erro ou alerta para o usuário
      alert('Por favor, selecione um ano para aplicar o filtro com o mês selecionado.');
      return; // Interrompe a execução do método aqui
    }

    // Exibe o spinner de carregamento
    this.loadingService.show();
    this.isLoading = true;
  
    const userId = this.currentUserID as string;
    
    console.log("Entrou applyFilters")
    console.log("selectedMonth", this.selectedMonth)
    console.log("selectedYear", this.selectedYear)
    console.log("selectedCategory", this.selectedCategory)
    console.log("selectedHolder", this.selectedHolder)
    console.log("userId", userId)

    // Chama a função no serviço que faz a consulta na base de dados com os filtros aplicados
    this.service.listFilteredExpenses({
      month: this.selectedMonth,
      year: this.selectedYear,
      category: this.selectedCategory,
      holder: this.selectedHolder,
      userId: userId
    }).then(filteredExpenses => {
      console.log("VOLTOU");
      // Atualiza a lista de despesas com os resultados filtrados
      this.listExpenses = filteredExpenses;
      // Esconde o spinner de carregamento
      this.isLoading = false;
      this.loadingService.hide();
    }).catch(error => {
      console.error('Erro ao aplicar os filtros:', error);
      // Esconde o spinner de carregamento e trata o erro conforme necessário
      this.isLoading = false;
      this.loadingService.hide();
    });
  }



  // Adicione esta lógica no método onde você trata as mudanças de seleção dos filtros
  updateFilterButtonState(): void {
    // Verifica se um mês foi selecionado verificando se 'selectedMonth' não é uma string vazia
    const isMonthSelected = this.selectedMonth !== '';
  
    // Verifica se o ano não foi selecionado ou é '0'
    const isYearNotSelected = !this.selectedYear || this.selectedYear === '0';
  
    // O botão deve ser desabilitado se um mês estiver selecionado E o ano não estiver selecionado ou for '0'
    this.isFilterButtonDisabled = isMonthSelected && isYearNotSelected;
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
    this.isLoading = true;
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
        this.isLoading = false;
      }, 500);
    }
  }

  // convertDate(data: Array<any>) {
  //   this.listExpenses = data.map(d => ({
  //     ...d,
  //     date: d.date && d.date.seconds ? new Date(d.date.seconds * 1000).toLocaleDateString('pt-BR') : d.date
  //   }));
  // }

  convertDate(data: Array<any>) {
    let years = new Set(); // Utilize um Set para armazenar os anos sem repetições
  
    this.listExpenses = data.map(d => {
      const convertedDate = d.date && d.date.seconds ? new Date(d.date.seconds * 1000) : d.date;
      const formattedDate = convertedDate instanceof Date ? convertedDate.toLocaleDateString('pt-BR') : d.date;
  
      // Se convertedDate for uma instância de Date, extraia o ano e adicione ao Set
      if (convertedDate instanceof Date) {
        const year = convertedDate.getFullYear();
        years.add(year);
      }
  
      return {
        ...d,
        date: formattedDate
      };
    });
  
    // Converte o Set para um array, ordena os anos do maior para o menor e atualiza a lista de anos
    this.years = Array.from(years).map(year => Number(year)).sort((a, b) => b - a);

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

  exportListToXLS() {
    // Criar uma nova planilha de trabalho
    const workbook = XLSX.utils.book_new();

    // Converter a lista de despesas para um formato adequado para a planilha
    const worksheetData = this.listExpenses.map(expense => ({
      Data: expense.date, // assumindo que 'expense.date' já está no formato desejado
      Valor: expense.value,
      Categoria: expense.category,
      Titular: expense.assignment, // assumindo que 'assignment' corresponde ao titular
      Descrição: expense.description,
      Cartão: expense.card,
      Parcela: expense.installment
    }));

    // Adicionar os dados à planilha
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Despesas');

    // Gerar um arquivo Excel (XLSX)
    XLSX.writeFile(workbook, 'lista-de-despesas.xlsx');
  }

  
}
