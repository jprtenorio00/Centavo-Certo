import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/service/auth.service';
import { LoadingService } from 'src/app/service/loading.service';
import { ManageService } from 'src/app/service/manage.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';
import { BehaviorSubject } from 'rxjs';
import { ImportExpensesComponent } from '../import-expenses/import-expenses.component';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.js';

interface Transaction {
  date: string;
  description: string;
  installment: string;
  value: string;
}

type MonthKey = 'JAN' | 'FEV' | 'MAR' | 'ABR' | 'MAI' | 'JUN' | 'JUL' | 'AGO' | 'SET' | 'OUT' | 'NOV' | 'DEZ';
const monthNumbers: { [key in MonthKey]: string } = {
  'JAN': '01', 'FEV': '02', 'MAR': '03', 'ABR': '04', 'MAI': '05',
  'JUN': '06', 'JUL': '07', 'AGO': '08', 'SET': '09', 'OUT': '10',
  'NOV': '11', 'DEZ': '12'
};

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})

export class ManageComponent implements OnInit {
  isLoading$ = new BehaviorSubject<boolean>(true);
  loading$ = this.loadingService.loading$;

  userId:  string = '';
  currentUserID: string | undefined = ''

  years: number[] = [];

  listExpenses: Array<any> = [];
  listCards: Array<any> = [];
  listCategories: Array<any> = [];
  listAssignment: Array<any> = [];

  filters = {
    month: '',
    year: '0',
    category: '',
    holder: ''
  };

  constructor(private service: ManageService,
              private authService: AuthService,
              public loadingService: LoadingService,
              public dialog: MatDialog) {  }

    ngOnInit() {
      this.initializeData();
    }           

    async initializeData() {
      this.isLoading$.next(true);
      try {
        this.currentUserID = await this.authService.getCurrentUserUID();
        this.userId = this.currentUserID as string;
        if (this.currentUserID) {
          await Promise.all([
            this.loadExpenses(this.currentUserID),
            this.loadCategories(this.currentUserID),
            this.loadCards(this.currentUserID),
            this.loadHolders(this.currentUserID)
          ]);
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        this.isLoading$.next(false);
      }
    }
  
    async loadExpenses(userId: string) {
      try {
        this.listExpenses = await this.service.listExpenses(userId);
        this.extractYearsFromExpenses();
        this.processExpensesData(this.listExpenses);
        console.log("listExpenses.length", this.listExpenses.length)
        console.log("loading$", this.loading$)
      } catch (error) {
        console.error('Error loading expenses list:', error);
      }
    }

    extractYearsFromExpenses() {
      const yearsSet = new Set(this.listExpenses.map(e => new Date(e.date).getFullYear()));
      this.years = Array.from(yearsSet).sort((a, b) => b - a);
    }    

    processExpensesData(data: Array<any>) {
      let years = new Set<number>();
      this.listExpenses = data.map(expense => {
        const [year, month, day] = expense.date.split('-');
        years.add(+year);
        return { ...expense, date: `${day}/${month}/${year}` };
      });
      this.years = Array.from(years).sort((a, b) => b - a);
    }

    async loadCategories(userId: string) {
      this.listCategories = await this.service.getListCategories(userId);
      this.listCategories = this.listCategories.filter(item => !Array.isArray(item.category)).sort((a, b) => a.category.localeCompare(b.category));
    }
    
    async loadCards(userId: string) {
      this.listCards = await this.service.getListCard(userId);
      this.listCards = this.listCards.filter(item => !Array.isArray(item.bank)).sort((a, b) => a.bank.localeCompare(b.bank));
    }    
    
    async loadHolders(userId: string) {
      this.listAssignment = await this.service.getListHolder(userId);
      this.listAssignment = this.listAssignment.filter(item => !Array.isArray(item.name)).sort((a, b) => a.name.localeCompare(b.name));
    }    

    applyFilters() {
      this.isLoading$.next(true);

      console.log("this.filters", this.filters)

      this.service.listFilteredExpenses({ ...this.filters, userId: this.userId })
        .then(filteredExpenses => {
          this.listExpenses = filteredExpenses;
          this.processExpensesData(this.listExpenses);
        })
        .catch(error => console.error('Error applying filters:', error))
        .finally(() => this.isLoading$.next(false));
    }
  
    resetFilters() {
      this.filters = {
        month: '',
        year: '0',
        category: '',
        holder: ''
      };
      this.initializeData();
    }

    exportListToXLS() {
      const workbook = XLSX.utils.book_new();
      const worksheetData = this.listExpenses.map(expense => ({
        Date: expense.date,
        Value: expense.value,
        Category: expense.category,
        Holder: expense.assignment,
        Description: expense.description,
        Card: expense.card,
        Installment: expense.installment
      }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Despesas');
      XLSX.writeFile(workbook, 'Extração Despesas.xlsx');
    }

    enableEditing(item: any, isEditing: boolean) {
      if (isEditing) {
        // Converte a data para o formato 'yyyy-MM-dd', compatível com input[type="date"]
        item.editDate = this.convertDateToISO(item.date);
      } else {
        // Reverter para a data original se necessário, assumindo que a data original está no formato 'dd/MM/yyyy'
        item.date = this.convertDateToBRFormat(item.editDate);
      }
      item.editing = isEditing; // Atualiza o estado de edição do item
    }
    
    // Função para converter data de 'dd/MM/yyyy' para 'yyyy-MM-dd'
    convertDateToISO(dateStr: string): string {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    convertDateToBRFormat(dateStr: string): string {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }

    openConfirmDialog(expenseId: string) {
      document.body.classList.add('no-visibility');
      const dialogRef = this.dialog.open(ConfirmDialogComponent);

      dialogRef.afterClosed().subscribe(async result => {
        document.body.classList.remove('no-visibility');
        if(result) {
          await this.deleteExpense(expenseId);
        }
      });      
    }

    async deleteExpense(expenseId: string) {
      this.isLoading$.next(true); // Indica o início de uma operação de carregamento
      try {
        await this.service.deleteExpense(this.userId, expenseId);
        // Atualiza a lista de despesas após a exclusão bem-sucedida
        await this.loadExpenses(this.userId);
      } catch (error) {
        console.error('Error deleting expense:', error);
        // Trate o erro conforme necessário, talvez mostrando uma mensagem ao usuário
      } finally {
        this.isLoading$.next(false); // Indica o fim da operação de carregamento
      }
    }

    async updateItem(item: any) {
      this.isLoading$.next(true); // Indica o início de uma operação de carregamento
      item.editing = false;
      item.date = this.convertDateToBRFormat(item.editDate);

      try {
        // Extrai mês e ano da data editada
        const { month, year } = this.extractMonthYear(item.editDate);
        
        console.log("month",month)
        console.log("year",year)

        // Prepara os dados para atualização
        const updatedExpenseData = {
          date: item.editDate,
          month: month, // Salva o mês extraído
          year: year, // Salva o ano extraído
          assignment: item.assignment,
          value: item.value,
          installment: item.installment,
          card: item.card,
          description: item.description,
          category: item.category,
        };
    
        // Chama o serviço para atualizar a despesa no banco de dados
        await this.service.updateExpense(this.userId, item.id, updatedExpenseData);
    
        // Atualiza a lista de despesas para refletir a mudança
        await this.loadExpenses(this.userId);
      } catch (error) {
        console.error('Error updating expense:', error);
        // Trate o erro conforme necessário, talvez mostrando uma mensagem ao usuário
      } finally {
        this.isLoading$.next(false); // Indica o fim da operação de carregamento
        item.editing = false; // Desativa o modo de edição para o item
      }
    }
    
    // Função auxiliar para extrair mês e ano de uma data formatada
    extractMonthYear(dateStr: string): { month: string, year: string } {
      const date = new Date(dateStr);
      const month = String(date.getMonth() + 1); // getMonth() retorna mês de 0 a 11
      const year = String(date.getFullYear());
    
      return { month, year };
    }  

    // async readPdfData(file: File) {
    //   try {
    //     const fileAsArrayBuffer = await file.arrayBuffer();
    //     const pdfDocument = await pdfjsLib.getDocument(new Uint8Array(fileAsArrayBuffer)).promise;
    //     const fullText = await this.readPdfText(pdfDocument);
    //     const { valoresText } = this.extractRelevantText(fullText);
    //     const potentialTransactions = this.divideIntoPotentialTransactions(valoresText);
    //     const transactions: Transaction[] = potentialTransactions.map(t => this.processTransaction(t, fullText)).filter(t => t !== null) as Transaction[];
    
    //     console.log(transactions);
    //   } catch (error) {
    //     console.error('Erro ao ler o PDF:', error);
    //   }
    // }
    
    // onFileSelected(event: Event) {
    //   const input = event.target as HTMLInputElement; // Aserção de tipo para HTMLInputElement
    //   if (input.files && input.files.length) {
    //     const file = input.files[0];
    //     this.readPdfData(file);
    //   }
    // }
    
    // async readPdfText(pdfDocument: pdfjsLib.PDFDocumentProxy): Promise<string> {
    //   let fullText = '';
    //   for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    //     const page = await pdfDocument.getPage(pageNum);
    //     const textContent = await page.getTextContent();
    //     fullText += textContent.items.map(item => ('str' in item) ? item.str : '').join('');
    //   }
    //   return fullText;
    // }
    
    // extractRelevantText(fullText: string): { extractedText: string, valoresText: string } {
    //   const startIndex = fullText.indexOf("TRANSAÇÕES ");
    //   let extractedText = '';
    //   let valoresText = '';
    
    //   if (startIndex !== -1) {
    //     extractedText = fullText.substring(startIndex);
    //     const startIndexValores = extractedText.indexOf("VALORES EM R$");
    
    //     if (startIndexValores !== -1) {
    //       valoresText = extractedText.substring(startIndexValores + "VALORES EM R$".length).trim();
    //     }
    //   }
    
    //   return { extractedText, valoresText };
    // }
    
    // divideIntoPotentialTransactions(valoresText: string): string[] {
    //   return valoresText.split(/(?=\d{2} [A-Z]{3})/);
    // }
    
    // processTransaction(transaction: string, fullText: string): Transaction | null {
    //   const regex = /(\d{2} [A-Z]{3}) (.*?) ?(?:- (\d+\/\d+))? ?(\d+,\d{2})/;
    //   const match = regex.exec(transaction);
    
    //   if (match) {
    //     const [_, date, description, installment, value] = match;
    //     if (!description.trim() || description.includes("VALORES EM R$BRL")) {
    //       return null;
    //     }
    
    //     const dayMonth = date.split(" ");
    //     const monthKey = dayMonth[1].toUpperCase() as MonthKey;
    
    //     const regexAno = /Data do vencimento: \d{2} [A-Z]{3} (\d{4})/;
    //     const matchAno = fullText.match(regexAno);
    //     const anoFatura = matchAno ? matchAno[1] : '';
    
    //     const formattedDate = `${dayMonth[0]}/${monthNumbers[monthKey]}/${anoFatura}`;
    
    //     return {
    //       date: formattedDate,
    //       description: description.trim(),
    //       installment: installment || "1/1",
    //       value: value.replace(',', '.')
    //     };
    //   }
    
    //   return null;
    // } 

    openImportExpenses(): void {

      const dialogRef = this.dialog.open(ImportExpensesComponent, {
        width: '800px'
        // Você pode passar dados para o dialog se necessário
      });
  
      dialogRef.afterClosed().subscribe(result => {
        console.log('O dialog foi fechado');
        // Use o resultado 'result' aqui, que é o valor retornado pelo dialog
      });
    }

}
