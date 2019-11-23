import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingsService } from './booking.service';
import { Booking } from './booking.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {

  loadedBookings: Booking[];
  isLoading = false;
  private bookingSub: Subscription
  constructor(
    private bookingService: BookingsService,
    private loadingController:LoadingController
  ) { }

  ngOnInit() {
    this.bookingSub = this.bookingService.bookings.subscribe((bookings) => {
      this.loadedBookings = bookings;
    });
    // this.loadedBookings = this.bookingService.bookings;
  }

  ionViewWillEnter(){
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe(()=>{
      this.isLoading = false;
    })
  }

  onCancelBooking(bookingId: string, slidingBookingElement: IonItemSliding) {
    this.loadingController.create({
      message:'Cancelling..'
    }).then(loadingEl=>{
      loadingEl.present();
      this.bookingService.cancelBooking(bookingId).subscribe(
        (bookings) => {
          this.loadedBookings = bookings;
          slidingBookingElement.close();
          loadingEl.dismiss();
        }
      );
    })
  }

  ngOnDestroy(): void {
    if (this.bookingSub) {
      this.bookingSub.unsubscribe();
    }
  }

}
