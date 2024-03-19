import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/service/auth.service';
import { CategoriesService } from 'src/app/service/categories.service';
import { LoadingService } from 'src/app/service/loading.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  loading$ = this.loadingService.loading$;
  listCategories: any[] = [];

  constructor(private service: CategoriesService, 
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
    // Inscreva-se no Observable para obter o currentUserUID
    this.authService.getCurrentUserUID().subscribe(currentUserUID => {
      // Verifique se o currentUserUID não é nulo antes de prosseguir
      if (currentUserUID) {
        const categoryName = this.formGroup.get('category')?.value;
        if (categoryName) {
          // Agora que você tem um currentUserUID válido, pode prosseguir com a lógica de adição de categoria
          this.service.addCategory(categoryName, currentUserUID).then(() => {
            this.formGroup.get('category')?.setValue('');
            this.getList();
          }).catch(error => {
            console.error('Erro ao adicionar categoria:', error);
          }).finally(() => {
            this.loadingService.hide();
          });
        } else {
          alert("Por favor, insira uma categoria válida.");
          this.loadingService.hide();
        }
      } else {
        console.error('UID do usuário não está disponível.');
        this.loadingService.hide();
        // Trate o caso em que o UID do usuário não está disponível, talvez redirecionando para o login
      }
    }, error => {
      console.error('Erro ao obter o UID do usuário:', error);
      this.loadingService.hide();
    });
  }

  async getList() {
    this.loadingService.show();
  
    // Inscreva-se no Observable para obter o currentUserUID
    this.authService.getCurrentUserUID().subscribe(async currentUserUID => {
      // Verifique se o currentUserUID não é nulo antes de prosseguir
      if (currentUserUID) {
        try {
          this.listCategories = await this.service.getListCategories(currentUserUID);
          this.listCategories = this.listCategories.filter(item => !Array.isArray(item.category)).sort((a, b) => a.category.localeCompare(b.category));
        } catch (error) {
          console.error('Erro ao carregar categorias:', error);
        } finally {
          this.loadingService.hide();
        }
      } else {
        console.error('UID do usuário não está disponível.');
        this.loadingService.hide();
        // Trate o caso em que o UID do usuário não está disponível
      }
    }, error => {
      console.error('Erro ao obter o UID do usuário:', error);
      this.loadingService.hide();
    });
  }

  async updateCategory(categoryId: string, newCategoryName: string) {
    // Inscreva-se no Observable para obter o currentUserUID
    this.authService.getCurrentUserUID().subscribe(async currentUserUID => {
      // Verifique se o currentUserUID não é nulo antes de prosseguir
      if (currentUserUID) {
        try {
          await this.service.updateCategory(currentUserUID, categoryId, newCategoryName);
          this.getList();
        } catch (error) {
          console.error('Erro ao atualizar categoria:', error);
        }
      } else {
        console.error('UID do usuário não está disponível.');
        // Trate o caso em que o UID do usuário não está disponível
      }
    }, error => {
      console.error('Erro ao obter o UID do usuário:', error);
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
  
  async deleteCategory(categoryId: string) {
    this.loadingService.show();
    // Inscreva-se no Observable para obter o currentUserUID
    this.authService.getCurrentUserUID().subscribe(async currentUserUID => {
      // Verifique se o currentUserUID não é nulo antes de prosseguir
      if (currentUserUID) {
        try {
          await this.service.deleteCategory(currentUserUID, categoryId);
          this.getList();
        } catch (error) {
          console.error('Erro ao excluir categoria:', error);
        } finally {
          this.loadingService.hide();
        }
      } else {
        console.error('UID do usuário não está disponível.');
        this.loadingService.hide();
        // Trate o caso em que o UID do usuário não está disponível
      }
    }, error => {
      console.error('Erro ao obter o UID do usuário:', error);
      this.loadingService.hide();
    });
  }
}