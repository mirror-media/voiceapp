import React from "react"
import { api } from "./api"

export default class WebAPI {

  /**測試音樂排行榜*/
  getMusicRankingList (id,results,sort) {
    const url = api.Mirror_album.replace('{id}', id).replace('{results}', results)
    return new Promise((resolve, reject) => {
      this.fetchNetData(url)
        .then(data => {
          resolve(data);
        })
        .catch(error => console.log(error))
    })
  }

  getMusicCateList (id,sort) {
    const url = api.Mirror_cate_album.replace('{id}', id).replace('{sort}', sort)
    return new Promise((resolve, reject) => {
      this.fetchNetData(url)
        .then(data => {
          resolve(data);
        })
        .catch(error => console.log(error))
    })
  }

  /**測試音樂排行榜*/
  getMusicDetailList (id) {
    const url = api.Mirror_listing.replace('{id}', id)
    return new Promise((resolve, reject) => {
      this.fetchNetData(url)
        .then(data => {
          resolve(data);
        })
        .catch(error => console.log(error))
    })
  }

  /**類別列表*/
  getMusicSectionList () {
    const url = api.Mirror_section_list
    return new Promise((resolve, reject) => {
      this.fetchNetData(url)
        .then(data => {
          resolve(data);
        })
        .catch(error => console.log(error))
    })
  }

  getMusicSectionListById (id) {
    const url = api.Mirror_section.replace('{id}', id)
    return new Promise((resolve, reject) => {
      this.fetchNetData(url)
        .then(data => {
          resolve(data);
        })
        .catch(error => console.log(error))
    })
  }

  /**Banner列表*/
  getBanner () {
    const url = api.Mirror_banner
    return new Promise((resolve, reject) => {
      this.fetchNetData(url)
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  /**測試音樂搜索*/
  getMusicSearch (keywords) {
    const url = api.Music_Search_Url.replace('{keywords}', keywords)
    return new Promise((resolve, reject) => {
      this.fetchNetData(url)
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  /**測試音樂歌词*/
  getMusicLrc (id) {
    const url = api.Music_Mp3_lrc.replace('{id}', id);
    return new Promise((resolve, reject) => {
      this.fetchNetData(url)
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          reject(error)
        })
    })
  }


  fetchNetData(url) {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((response)=>response.json())
        .then((responseData)=>{
          resolve(responseData);
        })
        .catch((error)=>{
          reject(error);
        })
        .done();
    })
  }
}
