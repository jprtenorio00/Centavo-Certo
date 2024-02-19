import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/service/auth.service';
import { CardsService } from 'src/app/service/cards.service';
import { LoadingService } from 'src/app/service/loading.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  loading$ = this.loadingService.loading$;
  listCards: any[] = [];
  listTypeCard: string[] = ['Crédito', 'Débito'];
  listNatureCard: string[] = ['Físico', 'Virtual'];

  constructor(private service: CardsService, 
              private authService: AuthService, 
              public loadingService: LoadingService,
              public dialog: MatDialog) { }

  ngOnInit() {
    setTimeout(() => {
      this.getList()
    }, 800);
  }

  public get formGroup(){
    return this.service.formGroup;
  }

  formatCardInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
  
    if (value.length > 4) {
      value = value.substring(value.length - 4)
    }
  
    input.value = value ? `xxxx.xxxx.xxxx.${value}` : '';
  }

  clearAllValues(){
    this.formGroup.get('bankIssuer')?.setValue('');
    this.formGroup.get('typeCard')?.setValue('');
    this.formGroup.get('cardDigits')?.setValue('');
    this.formGroup.get('natureCard')?.setValue('');
  }

  async onSubmit() {
    try {
      const currentUserUID = await this.authService.getCurrentUserUID();
      const bankIssuer = this.formGroup.get('bankIssuer')?.value;
      const typeCard = this.formGroup.get('typeCard')?.value;
      const cardDigits = this.formGroup.get('cardDigits')?.value;
      const natureCard = this.formGroup.get('natureCard')?.value;
      const checkInputs = this.checkInformations(bankIssuer, typeCard, cardDigits, natureCard)

      if (checkInputs && currentUserUID) {
        this.loadingService.show();
        await this.service.addValuesCard(bankIssuer, typeCard, cardDigits, natureCard, currentUserUID);
        this.clearAllValues();
        this.getList();
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria: ' + error);
    } finally {
      setTimeout(() => {
        this.loadingService.hide();
      }, 500);
    }
  }

  checkInformations(bankIssuer: String, typeCard: String, cardDigits: String, natureCard: String){
    if(!bankIssuer)
    {
      alert("Por favor, insira um banco emissor.");
      return false;
    }
    else if(!typeCard)
    {
      alert("Por favor, selecione um tipo de cartão.");
      return false;
    }
    else if(!cardDigits)
    {
      alert("Por favor, insira os dígitos do cartão.");
      return false;
    }
    else if(!natureCard)
    {
      alert("Por favor, selecione a natureza do cartão.");
      return false;
    }
    return true
  }

  async getList(){
    this.loadingService.show();
    try {
      const currentUserUID = await this.authService.getCurrentUserUID();
      if (currentUserUID) {
        this.listCards = await this.service.getListCard(currentUserUID);
        this.listCards = this.listCards.filter(item => !Array.isArray(item.bank)).sort((a, b) => a.bank.localeCompare(b.bank));
      }
    } catch (error) {
      console.error('Erro ao carregar os cartões:', error);
    } finally {
      setTimeout(() => {
        this.loadingService.hide();
      }, 500);
    }
  }

  openConfirmDialog(categoryId: string): void {
    document.body.classList.add('no-visibility');
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      document.body.classList.remove('no-visibility');
      if(result) {
        this.deleteCategory(categoryId);
      }
    });
  }
  
  async deleteCategory(cardId: string) {
    this.loadingService.show();
    try {
      const currentUserUID = await this.authService.getCurrentUserUID();
      if (currentUserUID) {
        await this.service.deleteCard(currentUserUID, cardId);
      }
      this.getList();
    } catch (error) {
      console.error('Erro ao excluir o cartão:', error);
    } finally {
      setTimeout(() => {
        this.loadingService.hide();
      }, 500);
    }
  }

}
