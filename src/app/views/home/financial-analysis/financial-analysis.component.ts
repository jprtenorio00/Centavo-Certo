import { Component, OnInit } from '@angular/core';
import { Color } from '@swimlane/ngx-charts';
import { AuthService } from 'src/app/service/auth.service';
import { FinancialAnalysisService } from 'src/app/service/financial-analysis.service';
import { ChartData } from 'src/app/shared/chart/chartData'
import { ChartsUtil } from 'src/app/shared/chart/charts-utils';

@Component({
  selector: 'app-financial-analysis',
  templateUrl: './financial-analysis.component.html',
  styleUrls: ['./financial-analysis.component.scss']
})
export class FinancialAnalysisComponent implements OnInit {

  username: string = ''
  userData: any;
  amount!: number;
  type!: 'expense' | 'income';
  chartData: any[] = [];
  legendPos: any = 'below'
  colorScheme = [
    {name: 'Receita', value: '#5AA454'},
    {name: 'Despesas', value: '#E53935'},
  ];

  constructor(private service: FinancialAnalysisService, private authService: AuthService) { }

  ngOnInit() {
    this.fetchUserLoggedIn()
    this.observableAmount()
    this.observableType()
    this.assembleGraph()
  }

  async fetchUserLoggedIn(){
    this.userData = await this.authService.getUserLoggedIn();
    if(this.userData)
    {
      this.username = this.userData?.name;
    }
  }

  observableAmount(){
    this.formGroup.get('amount')?.valueChanges.subscribe(amount => {
      this.amount = amount;
    });
  }

  observableType(){
    this.formGroup.get('type')?.valueChanges.subscribe(type => {
      this.type = type
    });
  }

  async saveData() {
    if (this.amount && this.type) {
      try {
        const currentUserUID = await this.authService.getCurrentUserUID();

        if (currentUserUID) {
          this.service.saveFinanceData(currentUserUID, {
            amount: this.amount,
            type: this.type,
            date: new Date()
          });

          this.assembleGraph();
        } else {
          console.error("UID do usuário não encontrado!");
        }
      } catch (error) {
        console.error("Erro ao obter UID:", error);
      }
    }
  }

  async assembleGraph() {
    try {
      const uid = await this.authService.getCurrentUserUID();
      if (uid) {
        const financeData = await this.service.getFinanceDataByUID(uid);
        this.chartData = this.transformDataForChart(financeData);
      }
    } catch (error) {
      console.error("Erro ao montar gráfico:", error);
    }
  }

  transformDataForChart(data: any[]): any[] {
    let count = 0;

    const modifiedData = data.map(item => {
        count++;
        return { ...item, uniqueName: count.toString() };
    });

    modifiedData.sort((a, b) => Number(a.uniqueName) - Number(b.uniqueName));
    const result = ChartsUtil.getCompositeGraphicObject(modifiedData, 'type', 'uniqueName', 'amount');

    result.forEach(item => {
        if (item.name === 'income') {
            item.name = 'Receita';
            item.series.forEach((element, index) => {
              element.name = index.toString()
            });
        } else if (item.name === 'expense') {
            item.name = 'Despesas';
            item.series.forEach((element, index) => {
              element.name = index.toString()
            });
        }
    });

    return result;
}

  public get formGroup(){
    return this.service.formGroup;
  }

}
