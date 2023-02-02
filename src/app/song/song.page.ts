import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder } from '@angular/forms';
import { DbService } from '../services/db.service';
import { ActivatedRoute,Router } from '@angular/router';

@Component({
  selector: 'app-song',
  templateUrl: './song.page.html',
  styleUrls: ['./song.page.scss'],
})
export class SongPage implements OnInit {

  editForm : FormGroup|any;
  id : any;
  constructor(private db: DbService, private router: Router,public formBuilder: FormBuilder, private actRoute : ActivatedRoute) {
    this.id = this.db.getSong(this.id).then((res:any) =>{
      this.editForm.setValue({
        artist_name : res['artist_name'],
        song_name : res['song_name']
      })
    })
  }

  ngOnInit() {
    this.editForm = this.formBuilder.group({
      artist_name :[''],
      song_name : ['']
    })
  }

  saveForm(){
    this.db.updateSong(this.id,this.editForm.value)
    .then((res:any)=>{
      console.log(res)
      this.router.navigate(['/home']);
    })
  }

}
