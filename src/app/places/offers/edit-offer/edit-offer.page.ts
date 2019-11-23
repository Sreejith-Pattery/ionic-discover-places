import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  form: FormGroup;
  private placesSub: Subscription;
  isLoading = false;
  placeId:string;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
    private loadingCtrl:LoadingController,
    private alertCtrl:AlertController,
    private router:Router
    ) { }

  ngOnInit() {
    this.isLoading = true;
    this.route.paramMap.subscribe(
      paramMap => {
        if (!paramMap.get('placeId')) {
          this.navCtrl.navigateBack('places/tabs/offers');
          return;
        } else {
          // this.place = this.placesService.getPlace(paramMap.get('placeId'))
          this.placeId = paramMap.get('placeId');
          this.placesSub = this.placesService
          .getPlace(paramMap.get('placeId'))
          .subscribe((place) => {
            this.place = place;
            this.form = new FormGroup({
              title: new FormControl(this.place.title, {
                updateOn: 'blur',
                validators: [Validators.required],
              }),
              description: new FormControl(this.place.description, {
                updateOn: 'blur',
                validators: [Validators.required, Validators.maxLength(180)],
              })
            })
            this.isLoading = false;
          }, error=>{
            console.log(error);
            this.alertCtrl.create({
              header:'Error',
              message:'Place could not be fetched',
              buttons:[{
                text:'OK',
                handler:()=>{
                  this.router.navigate(['/places/tabs/offers']);
                }
              }]
            })
          });
        }
      }
    );
  }

  onEditOffer() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl.create({
      message:'Updating Offer'
    }).then(loadingEl =>{
      loadingEl.present();
      this.placesService.updateOffer(this.place.id, this.form.value.title, this.form.value.description)
      .subscribe(()=>{
        loadingEl.dismiss();
      });
    });
    // console.log(this.form.controls);
  }

  ngOnDestroy(): void {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }


}
