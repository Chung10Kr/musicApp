import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Loading from "./view/Loading"
import List from "./view/List"
import { Audio } from 'expo-av';

import * as SQLite from 'expo-sqlite';

let playObject = new Audio.Sound();
const db = SQLite.openDatabase('db.childApp') 
let tableNm = "test1";
let musicType = [ "자연" , "동물" , "역할" ]
let musicList=[
  {id:1 , type:musicType[0] ,  musicTitle : "풍선아 풍선아" ,musicFile : "toBalloons.mp3",favYn:false},
  {id:2 , type:musicType[0] ,  musicTitle : "SHE" ,musicFile : "she.mp3",favYn:false},
  {id:3 , type:musicType[1] ,  musicTitle : "SHE1" ,musicFile : "she.mp3",favYn:false},
  {id:4 , type:musicType[1] ,  musicTitle : "SHE1" ,musicFile : "she.mp3",favYn:false},
  {id:5 , type:musicType[1] ,  musicTitle : "SHE1" ,musicFile : "she.mp3",favYn:false},
  {id:6 , type:musicType[1] ,  musicTitle : "SHE1" ,musicFile : "she.mp3",favYn:false},
  {id:7 , type:musicType[1] ,  musicTitle : "SHE1" ,musicFile : "she.mp3",favYn:false},
  {id:8 , type:musicType[1] ,  musicTitle : "SHE1" ,musicFile : "she.mp3",favYn:false},
  {id:9 , type:musicType[1] ,  musicTitle : "SHE1" ,musicFile : "she.mp3",favYn:false},
  {id:10 , type:musicType[2] ,  musicTitle : "SHE2" ,musicFile : "she.mp3",favYn:false},
  {id:11 , type:musicType[2] ,  musicTitle : "SHE2" ,musicFile : "she.mp3",favYn:false},
];
const sound = new Audio.Sound();
export default class extends React.Component {
  constructor (props){
    super(props)
  };
  state = {
    isLoading: true ,
    musicList:[]
  };
  componentWillUnmount(){
    this.createTable();
  }
  componentDidMount() {
    this.getMusicList();
  };
  // 테이블 생성
  createTable = async () =>{
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS '+tableNm+' (id INTEGER)'
      );
    })
  };
  async insertFav(id){
    db.transaction(tx => {tx.executeSql('INSERT INTO '+tableNm+' (ID) values (?)', [id]);},);
  };
  async deleteFav(id){
    db.transaction(tx => {tx.executeSql('DELETE FROM '+tableNm+' WHERE ID = ? ', [id]);},);
  };
  selectFav(){
    return new Promise((resolve=>{
      db.transaction(
        tx => {
          tx.executeSql('SELECT ID FROM '+tableNm+'', [], (trans, result) => {
            let row = result.rows;
            resolve(row)
            return row
          });
        }
      );
    }))
  }
  _onMusicFavSelected = (flag , id ) => {
    /**
     * false -> 즐겨찾기 안함
     * true -> 즐겨찾기 함
    */
    !flag ? this.insertFav(id) : this.deleteFav(id);
    this.getMusicList();
  };
  
  onMusicTurn = async (id)=>{

    const musicitem = musicList.find(function(music){
      if( music.id == id ){
        return music;
      }
    });
    let musicPath =  `http://172.30.1.14:3000/public/${musicitem.musicFile}` ;

    await sound.unloadAsync();
    await sound.loadAsync(  { uri:  musicPath } );
    await sound.playAsync();
  };
  onStopMusic = async()=> {
    await sound.unloadAsync();
  }
  getMusicList = async () => {
    const objectFav = await this.selectFav();
    let favList = [];
    for( var i=0 ; i <objectFav["_array"].length ; i++ ){
      favList.push( objectFav["_array"][i]["id"] )
    };
    musicList = musicList.map(function(music){
      if( favList.indexOf( music.id ) >= 0 ){
        music.favYn = true;
      }else{
        music.favYn = false;
      };
      return music;
    });

    this.setState({isLoading:false , musicList:musicList })
  };
  render() {
    
    let { isLoading } = this.state;
    
    return isLoading ? (
      <Loading />
    ) : (
      <List _musicList={musicList} _onMusicFavSelected={this._onMusicFavSelected} _onMusicTurn={this.onMusicTurn} _onStopMusic={this.onStopMusic} />
    );
  }
}
