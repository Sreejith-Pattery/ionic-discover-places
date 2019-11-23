import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../../places.service';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { Place } from '../../place.model';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { BookingsService } from 'src/app/bookings/booking.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  private placesSub: Subscription;
  isBookable = true;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private navController: NavController,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private bookingService: BookingsService,
    private loadingController:LoadingController,
    private authService:AuthService,
    private router:Router,
    private alertCtrl:AlertController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(
      paramMap => {
        if (!paramMap.get('placeId')) {
          this.navCtrl.navigateBack('places/tabs/discover');
          return;
        } else {
          this.isLoading = true;
          this.placesSub = this.placesService.getPlace(paramMap.get('placeId'))
          .subscribe((place) => {
            this.place = place;
            this.isBookable = (this.authService.userId !== this.place.userId);
            this.isLoading = false;
          }, error=>{
            this.alertCtrl.create({
              header:'Error',
              message:'Could not load Place',
              buttons:[{
                text:'Ok',
                handler:()=>{
                  this.router.navigate(['places/tabs/discover']);
                }
              }]
            }).then(alertEl=>{
              alertEl.present();
            })
          });

          // this.place = this.placesService.getPlace(paramMap.get('placeId'))
        }
      }
    );
  }

  onBookPlace(placeId) {
    // this.router.navigateByUrl('/places/tabs/discover');
    // this.navController.navigateBack('/places/tabs/discover');
    /* */

    this.actionSheetController.create({
      header: 'Chooses an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.onBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.onBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(actionSheetEl => {
      actionSheetEl.present();
    });
  }

  onBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalController
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place, selectedMode: mode }
      })
      .then(modalEl => {
        modalEl.present();
        return modalEl.onDidDismiss();
      })
      .then(resultData => {
        console.log(resultData.data, resultData.role);
        if (resultData.role == "confirm") {
          this.loadingController.create({
            message:'Booking...'
          }).then(loadingEl=>{
            loadingEl.present();
            const data = resultData.data.bookingData;
            this.bookingService.addBooking(
              this.place.id,
              this.place.title,
              this.place.imageUrl,
              data.firstName,
              data.lastName,
              data.guestNumber,
              data.dateFrom,
              data.dateTo
            ).subscribe(()=>{
              loadingEl.dismiss();
              this.router.navigate(['/bookings'])
            })
              // loadingEl.dismiss();
          })        
        }
      })
  }

  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

}
