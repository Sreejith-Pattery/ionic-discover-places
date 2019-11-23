import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    /* new Place(
      'p1',
      'Manhattan Mansion',
      'In the heart of New York City',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTQp2rzpsZzXH-XTSUaSRl8i1-hTYsztCZgKtjnp8ZMf3bqgNFW',
      149.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
    ),
    new Place(
      'p2',
      'L\'Amour Toujours',
      'A romantic place in Paris!',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcT9tnVHMPqQa4gBJAd_GvBPI4T2E5mGySITH8k759G3le0ecjzC',
      189.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'abc'
    ),
    new Place(
      'p3',
      'Foggy Palace',
      'Not you average city trip!',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRy3ttfvOtw2togEF2aeODjwV0pNzXKtlqfPT7yqK80_Z8kRgqQyg',
      99.99,
      new Date('2019-01-01'),
      new Date('2019-12-31'),
      'sree'
    ) */
  ]);

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  get places() {
    return this._places.asObservable();
  }

  getPlace(id: string) {
    /* return this._places.pipe(take(1), map(places => {
      return { ...places.find(place => place.id === id) };
    })); */
    return this.http
    .get<PlaceData>(`https://samplefcmessaging.firebaseio.com/offered-places/${id}.json`)
    .pipe(
      map(placeData => {
        // console.log(placeData);
        return new Place(
          id,
          placeData.title,
          placeData.description,
          placeData.imageUrl,
          placeData.price,
          new Date(placeData.availableFrom),
          new Date(placeData.availableTo),
          placeData.userId
        )
      })
    )
  }

  fetchPlaces() {
    return this.http
      .get('https://samplefcmessaging.firebaseio.com/offered-places.json')
      .pipe(
        map(resData => {
          const places = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              places.push(
                new Place(
                  key,
                  resData[key].title,
                  resData[key].description,
                  resData[key].imageUrl,
                  resData[key].price,
                  new Date(resData[key].availableFrom),
                  new Date(resData[key].availableTo),
                  resData[key].userId
                )
              )
            }
          }
          return places;
        }), tap(places => {
          this._places.next(places);
        })
      );
  }

  addPlace(title: string, description: string, price: number, availableFrom: Date, availableTo: Date) {
    let generatedId;
    const newPlace = new Place(
      Math.random().toString(),
      title, description,
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRy3ttfvOtw2togEF2aeODjwV0pNzXKtlqfPT7yqK80_Z8kRgqQyg',
      price,
      availableFrom,
      availableTo,
      this.authService.userId
    );
    return this.http.post<{ name: string }>('https://samplefcmessaging.firebaseio.com/offered-places.json', { ...newPlace, id: null })
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.places;
        }),
        take(1),
        tap((places) => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
      );
    /* return this.places.pipe(take(1), delay(1000), tap((places) => {
      this._places.next(places.concat(newPlace));
    })); */
  }

  updateOffer(placeId: string, title: string, description: string) {
    /* return this._places.pipe(take(1), delay(1000), tap(places => {
      const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
      const updatedPlaces = [...places];
      const oldPlace = updatedPlaces[updatedPlaceIndex];
      updatedPlaces[updatedPlaceIndex] = new Place(oldPlace.id, title, description, oldPlace.imageUrl, oldPlace.price, oldPlace.availableFrom, oldPlace.availableTo, oldPlace.userId);
    })); */
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap((places) => {
        if(!places || places.length <= 0){
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap((places) =>{
        const updatedPlaceIndex = places.findIndex(place => place.id == placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );
        return this.http.put(
          `https://samplefcmessaging.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        )
      }),
      tap(()=>{
        this._places.next(updatedPlaces);
      })
    )
  }

}
