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

  onSubmit() {
    // Primeiro, inscreve-se no Observable para obter o UID do usuário
    this.authService.getCurrentUserUID().subscribe(currentUserUID => {
      // Certifique-se de que o currentUserUID não é nulo antes de prosseguir
      if (currentUserUID) {
        // Agora você tem um UID válido do usuário, pode prosseguir com o restante da lógica
        try {
          const bankIssuer = this.formGroup.get('bankIssuer')?.value;
          const typeCard = this.formGroup.get('typeCard')?.value;
          const cardDigits = this.formGroup.get('cardDigits')?.value;
          const natureCard = this.formGroup.get('natureCard')?.value;
          const checkInputs = this.checkInformations(bankIssuer, typeCard, cardDigits, natureCard);
    
          if (checkInputs) {
            this.loadingService.show();
            this.service.addValuesCard(bankIssuer, typeCard, cardDigits, natureCard, currentUserUID).then(() => {
              this.clearAllValues();
              this.getList();
            }).catch(error => {
              console.error('Erro ao adicionar categoria:', error);
            }).finally(() => {
              this.loadingService.hide();
            });
          }
        } catch (error) {
          console.error('Erro ao adicionar categoria:', error);
          this.loadingService.hide();
        }
      } else {
        console.error('UID do usuário não disponível.');
      }
    });
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

    // Inscreve-se no Observable para obter o UID do usuário atual
    this.authService.getCurrentUserUID().subscribe(currentUserUID => {
      if (currentUserUID) {
        // UID do usuário está disponível, prossegue com a obtenção da lista
        this.service.getListCard(currentUserUID).then(listCards => {
          this.listCards = listCards.filter(item => !Array.isArray(item.bank)).sort((a, b) => a.bank.localeCompare(b.bank));
          this.loadingService.hide(); // Esconde o loading quando a operação for concluída
        }).catch(error => {
          console.error('Erro ao carregar os cartões:', error);
          this.loadingService.hide(); // Esconde o loading mesmo em caso de erro
        });
      } else {
        // Nenhum usuário autenticado, talvez redirecionar para a tela de login ou mostrar uma mensagem
        console.error('Usuário não está autenticado.');
        this.loadingService.hide(); // Esconde o loading já que não pode prosseguir
      }
    });    
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

    // Inscreve-se no Observable para obter o UID do usuário atual
    this.authService.getCurrentUserUID().subscribe(currentUserUID => {
      if (currentUserUID) {
        // UID do usuário está disponível, prossegue com a exclusão
        this.service.deleteCard(currentUserUID, cardId).then(() => {
          this.getList();
          this.loadingService.hide(); // Esconde o loading quando a operação for concluída
        }).catch(error => {
          console.error('Erro ao excluir o cartão:', error);
          this.loadingService.hide(); // Esconde o loading mesmo em caso de erro
        });
      } else {
        // Nenhum usuário autenticado, talvez redirecionar para a tela de login ou mostrar uma mensagem
        console.error('Usuário não está autenticado.');
        this.loadingService.hide(); // Esconde o loading já que não pode prosseguir
      }
    });
  }

}
