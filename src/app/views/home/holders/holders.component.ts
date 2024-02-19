import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/service/auth.service';
import { HoldersService } from 'src/app/service/holders.service';
import { LoadingService } from 'src/app/service/loading.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-holders',
  templateUrl: './holders.component.html',
  styleUrls: ['./holders.component.scss']
})
export class HoldersComponent implements OnInit {
  loading$ = this.loadingService.loading$;
  listHolder: any[] = [];

  constructor(private service: HoldersService, 
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

  async onSubmit() {
    this.loadingService.show();
    try {
      const currentUserUID = await this.authService.getCurrentUserUID();
      const fullName = this.formGroup.get('fullName')?.value;
      const relation = this.formGroup.get('relation')?.value;
      const checkInputs = this.checkInformations(fullName, relation)
  
      if (checkInputs && currentUserUID) {
        await this.service.addValuesHolder(fullName, relation, currentUserUID);
        this.formGroup.get('fullName')?.setValue('');
        this.formGroup.get('relation')?.setValue('');
        this.getList();
      } else {
        alert("Por favor, insira uma categoria válida.");
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria: ' + error);
    } finally {
      setTimeout(() => {
        this.loadingService.hide();
      }, 500);
    }
  }

  checkInformations(fullName: String, relation: String){
    if(!fullName)
    {
      alert("Por favor, insira o nome do titular.");
      return false;
    }
    else if(!relation)
    {
      alert("Por favor, insira a realação com o titular.");
      return false;
    }

    return true
  }

  async getList(){
    this.loadingService.show();
    try {
      const currentUserUID = await this.authService.getCurrentUserUID();
      if (currentUserUID) {
        this.listHolder = await this.service.getListHolder(currentUserUID);
        this.listHolder = this.listHolder.filter(item => !Array.isArray(item.name)).sort((a, b) => a.name.localeCompare(b.name));
      }
    } catch (error) {
      console.error('Erro ao carregar a lista de titulares:', error);
    } finally {
      setTimeout(() => {
        this.loadingService.hide();
      }, 500);
    }
  }

  openConfirmDialog(holderId: string): void {
    document.body.classList.add('no-visibility');
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      document.body.classList.remove('no-visibility');
      if(result) {
        this.deleteHolder(holderId);
      }
    });
  }
  
  async deleteHolder(holderId: string) {
    this.loadingService.show();
    try {
      const currentUserUID = await this.authService.getCurrentUserUID();
      if (currentUserUID) {
        await this.service.deleteHolder(currentUserUID, holderId);
      }
      this.getList();
    } catch (error) {
      console.error('Erro ao excluir o  titular:', error);
    } finally {
      setTimeout(() => {
        this.loadingService.hide();
      }, 500);
    }
  }

}
