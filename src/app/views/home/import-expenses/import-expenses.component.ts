import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/service/auth.service';
import { ManageService } from 'src/app/service/manage.service';
import { MatSelectModule } from '@angular/material/select';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { DashboardService } from 'src/app/service/dashboard.service';
import { MatSnackBar } from '@angular/material/snack-bar';


pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.js';

interface Transaction {
  date: string,
  month: string, // Salva o mês extraído
  year: string, // Salva o ano extraído
  assignment: string,
  value: string,
  installment: string,
  card: string,
  description: string,
  category: string,  
}

type MonthKey = 'JAN' | 'FEV' | 'MAR' | 'ABR' | 'MAI' | 'JUN' | 'JUL' | 'AGO' | 'SET' | 'OUT' | 'NOV' | 'DEZ';
const monthNumbers: { [key in MonthKey]: string } = {
  'JAN': '01', 'FEV': '02', 'MAR': '03', 'ABR': '04', 'MAI': '05',
  'JUN': '06', 'JUL': '07', 'AGO': '08', 'SET': '09', 'OUT': '10',
  'NOV': '11', 'DEZ': '12'
};

@Component({
  selector: 'tcc-import-expenses',
  templateUrl: './import-expenses.component.html',
  styleUrls: ['./import-expenses.component.scss']
})

export class ImportExpensesComponent {
  @ViewChild('fileInput') fileInput?: ElementRef;

  isLoading$ = new BehaviorSubject<boolean>(true);
  
  input: any;
  userId:  string = '';
  selectedBank: string = '';
  selectedFile: File | null = null;
  currentUserID: string | undefined = ''

  listCards: Array<any> = [];
  listAssignment: Array<any> = [];
  capturedTransactions: Transaction[] = [];

  filters = {
    card: '',
    holder: ''
  };

  constructor(private serviceManage: ManageService,
    private serviceDashboard: DashboardService,
    private authService: AuthService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar) {  }

  ngOnInit() {
    this.initializeData();
  }           

  async initializeData() {
    this.isLoading$.next(true);
  
    // Se inscreve no Observable para obter o UID do usuário atual
    this.authService.getCurrentUserUID().subscribe(async currentUserUID => {
      if (currentUserUID) {
        // Como o UID é válido, pode-se prosseguir com as operações assíncronas
        try {
          await Promise.all([
            this.loadCards(currentUserUID),
            this.loadHolders(currentUserUID)
          ]);
        } catch (error) {
          console.error('Error initializing data:', error);
        } finally {
          this.isLoading$.next(false);
        }
      } else {
        console.error("UID do usuário não encontrado!");
        this.isLoading$.next(false);
      }
    }, error => {
      console.error('Erro ao obter UID:', error);
      this.isLoading$.next(false);
    });
  }
  
  async loadCards(userId: string) {
    this.listCards = await this.serviceManage.getListCard(userId);
    this.listCards = this.listCards.filter(item => !Array.isArray(item.bank)).sort((a, b) => a.bank.localeCompare(b.bank));
  }   

  async loadHolders(userId: string) {
    this.listAssignment = await this.serviceManage.getListHolder(userId);
    this.listAssignment = this.listAssignment.filter(item => !Array.isArray(item.name)).sort((a, b) => a.name.localeCompare(b.name));
  } 

  async readPdfData(file: File) {
    try {
      const fileAsArrayBuffer = await file.arrayBuffer();
      const pdfDocument = await pdfjsLib.getDocument(new Uint8Array(fileAsArrayBuffer)).promise;
      const fullText = await this.readPdfText(pdfDocument);
      const { valoresText } = this.extractRelevantText(fullText);
      const potentialTransactions = this.divideIntoPotentialTransactions(valoresText);
      const transactions: Transaction[] = potentialTransactions.map(t => this.processTransaction(t, fullText)).filter(t => t !== null) as Transaction[];
  
      console.log(transactions);

      // Armazenar as transações capturadas na propriedade da classe
      this.capturedTransactions = transactions;
    } catch (error) {
      console.error('Erro ao ler o PDF:', error);
    }
  }
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.selectedFile = file;  // Atualizar a propriedade selectedFile
      this.readPdfData(file);
    } else {
      this.selectedFile = null;  // Limpar selectedFile se nenhum arquivo for selecionado
    }
  }
  
  async readPdfText(pdfDocument: pdfjsLib.PDFDocumentProxy): Promise<string> {
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => ('str' in item) ? item.str : '').join('');
    }
    return fullText;
  }
  
  extractRelevantText(fullText: string): { extractedText: string, valoresText: string } {
    const startIndex = fullText.indexOf("TRANSAÇÕES ");
    let extractedText = '';
    let valoresText = '';
  
    if (startIndex !== -1) {
      extractedText = fullText.substring(startIndex);
      const startIndexValores = extractedText.indexOf("VALORES EM R$");
  
      if (startIndexValores !== -1) {
        valoresText = extractedText.substring(startIndexValores + "VALORES EM R$".length).trim();
      }
    }
  
    return { extractedText, valoresText };
  }
  
  divideIntoPotentialTransactions(valoresText: string): string[] {
    return valoresText.split(/(?=\d{2} [A-Z]{3})/);
  }
  
  processTransaction(transaction: string, fullText: string): Transaction | null {
    const regex = /(\d{2} [A-Z]{3}) (.*?) ?(?:- (\d+\/\d+))? ?(\d+,\d{2})/;
    const match = regex.exec(transaction);
  
    if (match) {
      const [_, date, description, installment, value] = match;
      if (!description.trim() || description.includes("VALORES EM R$BRL")) {
        return null;
      }
  
      const dayMonth = date.split(" ");
      const monthKey = dayMonth[1].toUpperCase() as MonthKey;
  
      const regexAno = /Data do vencimento: \d{2} [A-Z]{3} (\d{4})/;
      const matchAno = fullText.match(regexAno);
      const anoFatura = matchAno ? matchAno[1] : '';
  
      const formattedDate = `${anoFatura}-${monthNumbers[monthKey]}-${dayMonth[0]}`;
  
      return {
        date: formattedDate,
        month: monthNumbers[monthKey], // Salva o mês extraído
        year: anoFatura, // Salva o ano extraído
        assignment: this.filters.holder,
        value: value.replace(',', '.'),
        installment: installment || "1/1",
        card: this.filters.card,
        description: description.trim(),
        category: "Carga Nubank",
      };
    }
  
    return null;
  } 

  async onSubmit() {
    this.isLoading$.next(true);
    try {
      for (const transaction of this.capturedTransactions) {
        // Aqui, você chamará o método do serviço para enviar a transação.
        // Supondo que o serviço seja this.service e o método para adicionar uma transação seja addTransaction
        this.userId = this.currentUserID as string;
        await this.serviceDashboard.addValuesCard(transaction, this.userId);
      }
      
      

      // Após enviar todas as transações, você pode limpar a lista se necessário
      this.capturedTransactions = [];

      this.snackBar.open('Transações enviadas com sucesso!', 'Fechar', {
        duration: 3000,
      });

      this.filters = {
        card: '',
        holder: ''
      };
      
      this.selectedBank = '';

      if (this.fileInput && this.fileInput.nativeElement) {
        this.fileInput.nativeElement.value = '';
      }

    } catch (error) {
      console.error('Erro ao enviar transações:', error);
    } finally {
      this.isLoading$.next(false);
    }
  }
  

}
