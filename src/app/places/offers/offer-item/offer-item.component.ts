import { Component, OnInit, Input } from '@angular/core';
import { Place } from '../../place.model';

@Component({
  selector: 'app-offer-item',
  templateUrl: './offer-item.component.html',
  styleUrls: ['./offer-item.component.scss'],
})
export class OfferItemComponent implements OnInit {
  @Input() offer:Place;
  dummyDate:Date;
  
  constructor() { }

  ngOnInit() {
    // this.dummyDate = this.getDummyDate();
  }

  getDummyDate(){
    return new Date();
  }
}
