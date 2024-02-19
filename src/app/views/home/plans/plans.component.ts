import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/service/loading.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.scss']
})
export class PlansComponent implements OnInit {

  loading$ = this.loadingService.loading$;

  constructor(public loadingService: LoadingService) { }

  ngOnInit() {
    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
    }, 400);
  }

}
