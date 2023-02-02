import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@awesome-cordova-plugins/sqlite-porter/ngx';
import { SQLiteObject, SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { Song } from './song';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  private storage : SQLiteObject | any ;
  songsList = new BehaviorSubject([]);
  private isDbReady : BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(
    private platform: Platform,
    private sqlite : SQLite,
    private httpClient : HttpClient,
    private sqlPorter : SQLitePorter
  ) {
    this.platform.ready().then(()=>{
      this.sqlite.create({
        name: 'positronx_db.db',
        location: 'default'
      })
      .then((db: SQLiteObject)=>{
        this.storage = db;
        this.getFakeData();
      });
    });
  }

  dbState(){
    return this.isDbReady.asObservable();
  }

  fetchSongs(): Observable <Song[]>{
    return this.songsList.asObservable();
  }

  getFakeData(){
    this.httpClient.get('assets/dump.sql',{responseType:'text'})
    .subscribe(data=>{
      this.sqlPorter.importSqlToDb(this.storage,data)
      .then(_ =>{
        this.getSongs();
        this.isDbReady.next(true);
      })
      .catch(error => console.error(error));
    });
  }

  getSongs(){
    return this.storage.executeSql('SELECT * FROM songtable',[]).then((res:any)=>{
      let items: Song[]|any = [];
      if(res.rows.length>0){
        for (var i =0 ; i<res.row.length;i++){
          items.push({
            id : res.rows.item(i).id,
            artist_name: res.rows.item(i).artist_name,
            song_name : res.rows.item(i).song_name
          });
        }
      }
      this.songsList.next(items);
    });
  }

  addSongs(artist_name : string, song_name: string){
    let data = [artist_name,song_name];
    return this.storage.executeSql(' INSERT INTO songtable (artist_name,song_name) VALUES (?,?)',data)
    .then((res:any)=>{
      this.getSongs();
    });
  }

  getSong(id:number): Promise<Song>{
    return this.storage.executeSql('SELECT * FROM songtable WHERE id =?',[id]).then((res:any)=>{
      return {
        id: res.rows.item(0).id,
        artist_name: res.rows.item(0).artist_name,
        song_name: res.rows.item(0).song_name
      }
    });
  }

  updateSong(id: number ,song: Song){
    let data = [song.artist_name,song.song_name];
    return this.storage.executeSql(`UPDATE songtable SET artist_name =? ,song_name=? WHERE id = ${id}`,data)
    .then((data:any) =>{
      this.getSongs();
    });
  }

  deleteSong(id:number){
    return this.storage.executeSql(`DELETE FROM songtable WHERE id = ?`,[id])
    .then((_: any)=>{
      this.getSongs();
    })
  }

}
