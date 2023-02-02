import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DbService } from '../services/db.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
mainForm: FormGroup | any;
Data : any[]=[]

  constructor(private db: DbService,
               public  formBuilder: FormBuilder,
                private toast: ToastController,
                 private router: Router) {}

    ngOnInit(){
      this.db.dbState().subscribe((res)=>{
        if(res){
          this.db.fetchSongs().subscribe(item =>{
            this.Data = item
          })
        }
      });
      this.mainForm = this.formBuilder.group({
        artist: [''],
        song:['']
      })
    }

  storeData(){
    this.db.addSongs(
      this.mainForm.value.artist,
      this.mainForm.value.song
    ).then((res:any)=>{
      this.mainForm.reset();
    })
  }

  deleteSong(id:number){
    this.db.deleteSong(id).then(async (res:any)=>{
      let toast = await this.toast.create({
        message: "Song Deleted",
        duration: 2500
      });
      toast.present();
    })
  }
}
