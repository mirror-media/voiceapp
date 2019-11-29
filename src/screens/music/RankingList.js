import React from 'react'
import { View, SectionList, Dimensions, Text, FlatList, TouchableOpacity, Image, StatusBar, StyleSheet, ScrollView, SafeAreaView } from 'react-native'
import Swiper from 'react-native-swiper'
import analytics from '@react-native-firebase/analytics'
import _ from 'lodash'

import { BackImg, MirrorImg } from "../../common/ImgConfig"
import { SideBar } from "../../components"
import { MyPageConfig } from "../../common/config"
import { PageStatusColor } from "../../common/BaseContent"
import { screenW } from "../../utils/utils"
import WebAPI from "../../service"


const { width ,height } = Dimensions.get('window')

export default class RankingList extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      header: null
    }
  }

  constructor(props: any) {
    super(props);

    this.state = {
      bgColor: PageStatusColor.music,
      HomeBgColor: PageStatusColor.Home,
      itemlist:[],
      rankingList: [],
      recommendList: [],
      sections: [],
    }
  }

  componentWillMount () {
    this.HttpMusic  = new WebAPI()
    this.getBannerList()
    this.getSections()
  }

  getBannerList = () => {
    this.HttpMusic.getBanner()
      .then(res => {
        this.setState({
          itemlist: res._items
        })
      })
      .catch(error => {
        console.log(error);
      })
  }
 
  getSections = () => {
    this.HttpMusic.getMusicSectionList().then(res => {
      const tabRoutesConfig = res._items.map((element,index) => {
        return { title: element.title, key: element._id }
      })

      const sectionsArr = res._items.map((element,index) => {
        return { id: element._id, title: element.title, key: index, data: [], tabs: tabRoutesConfig}
      })
      const promiseArr = []
      
      res._items.forEach(item => {
        promiseArr.push(this.callGetMusicRankingListById(item._id))
      })

      Promise.all(promiseArr).then(values => {
        values.forEach((item, index) => {
          sectionsArr[index].data = [item]
        })

        this.setState({sections: sectionsArr})
      })
    }).catch(error => {
      console.log(error);
    })
  }

  callGetMusicRankingListById = (id) => {
    return this.HttpMusic.getMusicRankingList(id, 6).then(res => {
      return res._items
    }).catch(err => {
      console.log(err)
      return []
    })
  }

  bannerImg = () => {
    const banner = this.state.itemlist.map((banner, i) => {
      return <Image key={i} source={{uri: banner.heroImage.image.url}} style={styles.img}/>
    })
    return banner
  }

  singleImg = (img, title, writers) => {
    const styles = singleImgStyles;
    const musicWriter = writers.map((writer, i) => {
      return <Text key={i}>
        {writer.name}{' '}
      </Text>
    })
    return <View style={styles.container}>
      <Image source={img ? { uri: img.image.url } : MirrorImg} style={styles.imgContainer} />
      <Text numberOfLines={2} style={styles.textContainer}>{title}</Text>
      <Text style={styles.writerContainer}>
        {musicWriter}
      </Text>
    </View>
  }

  singleList = (tracks) => {
    const musicTracks = tracks.map((music, i) => {
      return <Text key={i} numberOfLines={1}>
        {`${i+1}.${music.first} - ${music.second}`}
      </Text>
    })
    return <View style={singleListStyles.container}>
      {musicTracks}
    </View>
  }

  singleMusic = (item) => {
    const styles = singleMusicStyles;

    return <TouchableOpacity activeOpacity={1} onPress={() => this.navigateToMusicList({id: item.id})}>
      <View style={styles.container}>
        {this.singleImg(item.coverImgUrl, item.updateFrequency)}
        {this.singleList(item.tracks)}
      </View>
    </TouchableOpacity>
  }

  recommendMusic = (item) => {
    const styles = singleMusicStyles
    const musicWriter = item.writers.map((writer, i) => {
      return <Text key={i}>
        {writer.name}{' '}
      </Text>
    })
    const musicVocal = 
    item.vocals
    ? (item.vocals.map((vocal, i) => {
        return <Text key={i}>
          {vocal.name}{' '}
        </Text>
      }))
    : ""
    
    return <TouchableOpacity style={[styles.recommendMusic, { width: picWidth }]} activeOpacity={1} onPress={() => this.props.navigation.navigate('MusicList', {id: item._id, name: item.name, img: item.heroImage, content: item.content, writer: musicWriter, vocal: musicVocal})}>
        {this.singleImg(item.heroImage, item.name, item.writers)}
    </TouchableOpacity>
  }

  // to category
  navigateToCategory = async (obj) => {
    await analytics().logEvent('app_home', {
      section_more: obj.id
    })

    this.props.navigation.navigate('Category', obj)
  }

  // to music list (album)
  navigateToMusicList = async (obj) => {
    await analytics().logEvent('app_home', {
      album: obj.id
    })

    this.props.navigation.navigate('MusicList', obj)
  }

  render () {
    const { rankingList, recommendList } = this.state;
    const Recommend = ({ section: { data } }) => (
      <View style={{backgroundColor: '#fff'}}>
      <FlatList
        style={{marginHorizontal: 15,backgroundColor: '#fff'}}
        data={data[0]}
        numColumns={3}
        renderItem={({item}) => this.recommendMusic(item)}
        keyExtractor={(item, index) => item + index}
      />
      <View style={{height: 16,backgroundColor: "#eeeeee"}}/>
      <View style={{height: 6,backgroundColor: this.state.bgColor}}/>
      </View>
    )
    const musicHeader = ({ section: { id, title, key, tabs } }) => (
      <View style={{backgroundColor: '#fff'}}>
        {/* <View style={{height: 6,backgroundColor: this.state.bgColor}}/> */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerStyle}>{title}</Text>
          <TouchableOpacity
          style={{marginRight: 5}}
          onPress={() => this.navigateToCategory({index: key, id, tabs})} >
          <Text style={{fontSize: 13,color: '#4a4a4a'}}>更多</Text>
        </TouchableOpacity>
        </View>
      </View>
    )

    return (
      <SafeAreaView style={styles.container}>
        <View style={{ height: width * 300 / 540, width }}>
          <Swiper
              key={this.state.itemlist.length}
              dot={<View style={{backgroundColor:'#eeeeee', width: 5, height: 5,borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
              activeDot={<View style={{backgroundColor: this.state.bgColor, width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
              autoplay={true}
              horizontal={true}
              paginationStyle={{bottom: 10}}
              showsButtons={false}>
              {this.bannerImg()}
          </Swiper>
        </View>
        <View style={{height: 6,backgroundColor: this.state.bgColor}}/>
        <SectionList
          stickySectionHeadersEnabled={false}
          renderSectionHeader= {musicHeader}
          sections={this.state.sections}
          keyExtractor={(item, index) => item + index}
          renderItem={Recommend}
        />
    </SafeAreaView>
    );
  }
}

const picWidth = (screenW - 10) / 3 - 10

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeeee',
  },
  headerContainer: {
    marginTop: 15,
    marginHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStyle: {
    flex: 5,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000'
  },
  listType: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: PageStatusColor.music,
    borderRadius: 15,
    marginLeft: 10,
    backgroundColor: '#fff'
  },
  listTypeHighlight: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 15,
    marginLeft: 10,
    borderColor: PageStatusColor.music,
    backgroundColor: PageStatusColor.music
  },
  swiper: {},
    img: {
        width: width,
        height: width * 300 / 540
    }
})

const singleMusicStyles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginTop: 5,
    flexDirection: 'row'
  },
  recommendMusic: {
    flex:1,
    alignItems: 'center',
    // borderRadius: 3,
    marginHorizontal: 5,
    marginTop: 20
  }
})

const singleListStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5
  }
})

const singleImgStyles = StyleSheet.create({
  container: {
    // position: 'relative',
    // width: 120,
    // height: 150,
    // left: 13,
  },
  imgContainer: {
    width: width * 0.27,
    height: width * 0.27,
    borderRadius: 3
  },
  textContainer: {
    top: 10,
    color: '#4a4a4a',
    fontSize: 13
  },
  writerContainer: {
    top: 15,
    color: '#7d7d7d',
    fontSize: 11
  }
})
