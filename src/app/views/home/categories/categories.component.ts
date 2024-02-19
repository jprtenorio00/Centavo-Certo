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
    try {
      const currentUserUID = await this.authService.getCurrentUserUID();
      const categoryName = this.formGroup.get('category')?.value;
  
      if (categoryName && currentUserUID) {
        await this.service.addCategory(categoryName, currentUserUID);
        this.formGroup.get('category')?.setValue('');
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

  async getList(){
    this.loadingService.show();
    try {
      const currentUserUID = await this.authService.getCurrentUserUID();
      if (currentUserUID) {
        this.listCategories = await this.service.getListCategories(currentUserUID);
        this.listCategories = this.listCategories.filter(item => !Array.isArray(item.category)).sort((a, b) => a.category.localeCompare(b.category));
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setTimeout(() => {
        this.loadingService.hide();
      }, 500);
    }
  }

  async updateCategory(categoryId: string, newCategoryName: string) {
    try {
      const currentUserUID = await this.authService.getCurrentUserUID();
      if (currentUserUID) {
        await this.service.updateCategory(currentUserUID, categoryId, newCategoryName);
      }
      this.getList();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
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
  
  async deleteCategory(categoryId: string) {
    this.loadingService.show();
    try {
      const currentUserUID = await this.authService.getCurrentUserUID();
      if (currentUserUID) {
        await this.service.deleteCategory(currentUserUID, categoryId);
      }
      this.getList();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    } finally {
      setTimeout(() => {
        this.loadingService.hide();
      }, 500);
    }
  }

}