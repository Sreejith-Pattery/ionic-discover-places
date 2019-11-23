import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit,OnDestroy {

  offers: Place[];
  private placesSub:Subscription;
  constructor(
    private placesService: PlacesService,
    private router: Router
  ) { }

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe((places)=>{
      this.offers = places;
    });
  }
  ionViewWillEnter() {
    let isLoading = true;
    this.placesService.fetchPlaces().subscribe(()=>{
      isLoading = false;
    });
  }
  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId])
    console.log("offerid", offerId)
  }
  ngOnDestroy(): void {
    if(this.placesSub){
      this.placesSub.unsubscribe();
    }
  }
}
