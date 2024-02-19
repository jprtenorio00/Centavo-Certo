import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { DashboardService } from 'src/app/service/dashboard.service';
import { LoadingService } from 'src/app/service/loading.service';
import { ChartsUtil } from 'src/app/shared/chart/charts-utils';
import { SimpleGraphicObject } from 'src/app/shared/chart/simple-graphic-object';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  listCards: Array<any> = []
  listAssignment: Array<any> = []
  listCategory: Array<any> = []
  listDate: Array<any> = []
  initialListChartCategory: Array<any> = []
  loading$ = this.loadingService.loading$;
  currentUserID: string | undefined = ''

  chartDataCategory: SimpleGraphicObject[] = [];
  chartDataCategoryPercentage: SimpleGraphicObject[] = [];
  chartDataCard: SimpleGraphicObject[] = [];
  chartDataCardPercentage: SimpleGraphicObject[] = [];
  chartDataHolder: SimpleGraphicObject[] = [];
  chartDataDate: any = [];
  legendPos: any = 'below'
  colorScheme: any = {
    domain: ['#37447E', '#929ECC', '#6F7CB2', '#505F98', '#111B47']
  };

  averageSpendingMonth: number = 0
  averageSpendingInMainCategory: number = 0
  averageSpendingByHolder: number = 0
  averageSpendingInMonth: number = 0

  constructor(  private service: DashboardService,
                private router: Router,
                public loadingService: LoadingService,
                private authService: AuthService, ) { }

  ngOnInit() {
    setTimeout(() => {
      this.getUserId();
    }, 1000);
  }

  getAllLists(){
    setTimeout(() => {
      this.getListCards();
      this.getListCategory();
      this.getListHolders();
      this.getListDates();
      this.formGroup.get('date')?.setValue(new Date);
    }, 800);
  }

  async getUserId(){
    try {
      this.currentUserID = await this.authService.getCurrentUserUID();
      this.getAllLists();
    } catch (error) {
      console.error("Erro ao recuperar o usuário " + error);
    }
  }

  async onSubmit() {
    this.loadingService.show();
    try {
      const currentUserUID = this.currentUserID;
      const date = this.formGroup.get('date')?.value;
      const assignment = this.formGroup.get('assignment')?.value;
      const value = this.formGroup.get('value')?.value;
      const installment = this.formGroup.get('installment')?.value;
      const card = this.formGroup.get('card')?.value;
      const description = this.formGroup.get('description')?.value;
      const category = this.formGroup.get('category')?.value;
      const checkInputs = this.checkInformations(date, assignment, value, installment, card, description, category)

      if (checkInputs && currentUserUID) {
        await this.service.addValuesCard({
          date: date,
          assignment: assignment,
          value: value,
          installment: installment,
          card: card,
          description: description,
          category: category,
        }, currentUserUID);
        this.clearAllValues();
        this.getListDates();
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria: ' + error);
    } finally {
      setTimeout(() => {
        this.loadingService.hide();
      }, 500);
    }
  }

  checkInformations(date: String, assignment: String, value: String, installment: String,
                    card: String, description: String, category: String){
    if(!date)
    {
      alert("Por favor, insira uma data");
      return false;
    }
    else if(!assignment)
    {
      alert("Por favor, um titular");
      return false;
    }
    else if(!value)
    {
      alert("Por favor, insira o valor");
      return false;
    }
    else if(!card)
    {
      alert("Por favor, selecione o cartão");
      return false;
    }
    else if(!category)
    {
      alert("Por favor, selecione uma categoria");
      return false;
    }
    return true
  }

  clearAllValues(){
    this.formGroup.get('date')?.setValue('');
    this.formGroup.get('assignment')?.setValue('');
    this.formGroup.get('value')?.setValue('');
    this.formGroup.get('installment')?.setValue('');
    this.formGroup.get('card')?.setValue('');
    this.formGroup.get('description')?.setValue('');
    this.formGroup.get('category')?.setValue('');
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

  async getListDates(){
    this.loadingService.show();
    try
    {
      const currentUserUID = this.currentUserID;
      if(currentUserUID)
      {
        this.listDate = await this.service.getListDates(currentUserUID);
        this.setInitialListChartCategory(this.listDate)
        this.setInitialListChartCategoryPercentage(this.listDate)
        this.setInitialListCharCard(this.listDate)
        this.setInitialListCharCardPercentage(this.listDate)
        this.setInitialListChartHolder(this.listDate)
        this.setInitialListChartDate(this.listDate)

        this.setValueAverageSpending(this.listDate)
        this.setValueAverageSpendingInMainCategory(this.listDate)
        this.setValueAverageSpendingByHolder(this.listDate)
        this.setValueExpensesCountInMonth(this.listDate)
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

  setInitialListChartCategory(data: Array<any>) {
    const transformedData = ChartsUtil.getSimpleGraphicObject(data, 'category', 'value', 'description');
    transformedData.sort((a,b) => b.value - a.value)
    this.chartDataCategory = transformedData;
  }

  setInitialListChartCategoryPercentage(data: Array<any>) {
    const sumByCard: Record<string, number> = data.reduce((acc, item) => {
      const value = parseFloat(item.value);
      if (!isNaN(value)) { 
        acc[item.category] = (acc[item.category] || 0) + value;
      }
      return acc;
    }, {});
  
    const totalValue = Object.values(sumByCard).reduce((sum, current) => sum + current, 0);

    const transformedData = Object.entries(sumByCard).map(([category, value]) => {
      return new SimpleGraphicObject(
        category,
        (value / totalValue) * 100,
        null 
      );
    });
  
    transformedData.sort((a, b) => a.name.localeCompare(b.name));
  
    this.chartDataCategoryPercentage = transformedData;
  }

  setInitialListCharCard(data: Array<any>) {
    const transformedData = ChartsUtil.getSimpleGraphicObject(data, 'card', 'value', 'description');
    transformedData.sort((a,b) => b.value - a.value)
    this.chartDataCard = transformedData;
  }

  setInitialListCharCardPercentage(data: Array<any>) {
    const sumByCard: Record<string, number> = data.reduce((acc, item) => {
      const value = parseFloat(item.value);
      if (!isNaN(value)) { 
        acc[item.card] = (acc[item.card] || 0) + value;
      }
      return acc;
    }, {});
  
    const totalValue = Object.values(sumByCard).reduce((sum, current) => sum + current, 0);

    const transformedData = Object.entries(sumByCard).map(([card, value]) => {
      return new SimpleGraphicObject(
        card,
        (value / totalValue) * 100,
        null 
      );
    });
  
    transformedData.sort((a, b) => a.name.localeCompare(b.name));
  
    this.chartDataCardPercentage = transformedData;
  }  

  setInitialListChartHolder(data: Array<any>) {
    const transformedData = ChartsUtil.getSimpleGraphicObject(data, 'assignment', 'value', 'description');
    transformedData.sort((a,b) => b.value - a.value)
    this.chartDataHolder = transformedData;
  }

  setInitialListChartDate(data: Array<any>) {
    const dataWithConvertedDates = data.map(d => ({
      ...d,
      monthYear: new Date(d.date.seconds * 1000).toLocaleDateString('pt-BR', {
        month: 'long'
      }),
      monthNumber: new Date(d.date.seconds * 1000).getMonth()
    }));

    const groupedData = dataWithConvertedDates.reduce((acc, curr) => {
      const monthYear = curr.monthYear;
      if (!acc[monthYear]) {
        acc[monthYear] = { name: monthYear, value: 0, monthNumber: curr.monthNumber };
      }
      acc[monthYear].value += curr.value;
      return acc;
    }, {});

    const sortedData = Object.keys(groupedData)
      .map(key => groupedData[key])
      .sort((a, b) => a.monthNumber - b.monthNumber);

    const transformedData = sortedData.map(({ name, value }) => ({ name, value }));
    transformedData.sort((a,b) => b.value - a.value)
    this.chartDataDate = transformedData;
  }

  redirectToCardPage() {
    this.router.navigate(['/cards']);
  }

  redirectToHolderPage() {
    this.router.navigate(['/holders']);
  }

  redirectToCategoryPage() {
    this.router.navigate(['/categories']);
  }

  public get formGroup(): FormGroup {
    return this.service.formGroup
  }

  yAxisTickFormatting(val: { toLocaleString: () => any; }){
    return val.toLocaleString();
  }

  setValueAverageSpending(data: Array<any>) {
    let total: number = 0;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
  
    data.forEach(element => {
      if (element.category && element.date) {
        const date = new Date(element.date.seconds * 1000);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        if (month === currentMonth && year === currentYear) {
          total += element.value;
        }
      }
    });
  
    this.averageSpendingMonth = total > 0 ? total : 0;
  }

  setValueAverageSpendingInMainCategory(data: Array<any>) {
    let total: number = 0;
    let quantidade: number = 0;
    const categoryTotals: { [key: string]: { total: number; count: number } } = {};
  
    // Acumular o total e a contagem por categoria.
    data.forEach(element => {
      if (element.category) {
        if (categoryTotals[element.category]) {
          categoryTotals[element.category].total += element.value;
          categoryTotals[element.category].count += 1;
        } else {
          categoryTotals[element.category] = { total: element.value, count: 1 };
        }
      }
    });
  
    // Determinar a categoria principal (com maior gasto total).
    const mainCategory = Object.keys(categoryTotals).reduce((a, b) => 
      categoryTotals[a].total > categoryTotals[b].total ? a : b
    );
  
    // Se a categoria principal foi encontrada, calcular a média.
    if (mainCategory) {
      total = categoryTotals[mainCategory].total;
      quantidade = categoryTotals[mainCategory].count;
    }
  
    this.averageSpendingInMainCategory = quantidade > 0 ? total / quantidade : 0;
  }

  setValueAverageSpendingByHolder(data: Array<any>) {
    let sumOfAverages: number = 0;
    let totalHolders: number = 0;
    const totalsByHolder: { [key: string]: number } = {};
    const countsByHolder: { [key: string]: number } = {};
  
    // Acumular o total e a contagem por titular.
    data.forEach(element => {
      if (element.assignment) {
        totalsByHolder[element.assignment] = (totalsByHolder[element.assignment] || 0) + element.value;
        countsByHolder[element.assignment] = (countsByHolder[element.assignment] || 0) + 1;
      }
    });
  
    // Calcular a média para cada titular e somar essas médias.
    Object.keys(totalsByHolder).forEach(holder => {
      const average = totalsByHolder[holder] / countsByHolder[holder];
      sumOfAverages += average;
      totalHolders += 1;
    });
  
    // Calcular a média geral das médias de gastos por titular.
    this.averageSpendingByHolder = totalHolders > 0 ? sumOfAverages / totalHolders : 0;
  }

  setValueExpensesCountInMonth(data: Array<any>) {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    let count = 0;
  
    data.forEach(element => {
      if (element.category && element.date) {
        const date = new Date(element.date.seconds * 1000);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
  
        if (month === currentMonth && year === currentYear) {
          count++;
        }
      }
    });
  
    this.averageSpendingInMonth = count;
  }

}
