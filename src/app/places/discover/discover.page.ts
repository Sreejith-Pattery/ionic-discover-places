import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listLoadedPlace: Place[];
  placesSub: Subscription;
  relevantPlaces:Place[];

  constructor(
    private placesService: PlacesService,
    private authService:AuthService
  ) { }

  ngOnInit() {
    // this.loadedPlaces = this.placesService.places;
    this.placesSub = this.placesService.places.subscribe((places) => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listLoadedPlace = this.relevantPlaces.slice(1);
    });
  }

  ionViewWillEnter() {
    let isLoading = true;
    this.placesService.fetchPlaces().subscribe(()=>{
      isLoading = false;
    });
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    console.log(event.detail);
    if(event.detail.value == 'all'){
      this.relevantPlaces = this.loadedPlaces;
    } else {
      this.relevantPlaces = this.loadedPlaces.filter(place=>{
        return place.userId !== this.authService.userId;
      });
    }
    this.listLoadedPlace = this.relevantPlaces.slice(1);
  }

  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

}
