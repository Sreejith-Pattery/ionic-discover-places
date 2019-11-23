import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface BookingData {
    bookedFrom:string,
    bookedTo:string,
    firstName:string,
    guestNumber:number,
    lastName:string,
    placeId:string,
    placeImage:string,
    placeTitle:string,
    userId: string
  }

@Injectable({ providedIn: 'root' })
export class BookingsService {
    private _bookings = new BehaviorSubject<Booking[]>([
        /* {
            id: 'xyz',
            placeId: 'p1',
            placeTitle: 'Manhattan Mansion',
            guestNumber: 2,
            userId: 'abc'
        } */
    ]);

    constructor(
        private authService: AuthService,
        private httpClient:HttpClient
    ) {

    }

    get bookings() {
        return this._bookings;
    }

    addBooking(placeId: string, placeTitle: string, placeImage: string, firstName: string, lastName: string, guestNumber: number, dateFrom: Date, dateTo: Date) {
        let generateId:string;
        const newBooking = new Booking(
            Math.random().toString(),
            placeId,
            this.authService.userId,
            placeTitle,
            placeImage,
            firstName,
            lastName,
            guestNumber,
            dateFrom,
            dateTo
        );
        
        return this.httpClient.post<{name:string}>('https://samplefcmessaging.firebaseio.com/bookings.json', 
        { ...newBooking, id:null })
        .pipe(switchMap(resData=>{
            generateId = resData.name;
            return this.bookings;
        }),
        take(1),
        tap(bookings=>{
            newBooking.id = generateId;
            this._bookings.next(bookings.concat(newBooking));
        }));

       /*  return this._bookings.pipe(
            take(1),
            delay(1000),
            tap((bookings) => {
                this._bookings.next(bookings.concat(newBooking));
            })); */
    }

    cancelBooking(bookingId: string) {
        return this.httpClient.delete(`https://samplefcmessaging.firebaseio.com/bookings/${bookingId}.json`)
        .pipe(switchMap(()=>{
            return this.bookings;
        }), 
        take(1),
        tap(bookings=>{
            this._bookings.next(bookings.filter(b => b.id !== bookingId));
        }))

        /* return this._bookings.pipe(
            take(1),
            delay(1000),
            tap((bookings) => {
                this._bookings.next(bookings.filter(b => b.id !== bookingId));
            })); */
    }

    fetchBookings(){
        return this.httpClient
        // .get<{[key:string]:BookingData}>('https://samplefcmessaging.firebaseio.com/bookings.json?orderBy="userId"&equalTo=""')
        .get<{[key:string]:BookingData}>('https://samplefcmessaging.firebaseio.com/bookings.json')
        .pipe(
            map(
                bookingData=>{
                    const bookings = [];
                    for(const key in bookingData){
                        if(bookingData.hasOwnProperty[key]){
                            bookings.push(new Booking(
                                key,
                                bookingData[key].placeId,
                                bookingData[key].userId,
                                bookingData[key].placeTitle,
                                bookingData[key].placeImage,
                                bookingData[key].firstName,
                                bookingData[key].lastName,
                                bookingData[key].guestNumber,
                                new Date(bookingData[key].bookedFrom),
                                new Date(bookingData[key].bookedTo),
                            ))
                        }
                    }
                    return bookings;
                }
            ),
            tap(bookings=>{
                this._bookings.next(bookings);
            })
        );
    }
}