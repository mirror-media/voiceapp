import React from 'react'
import { View, Text, TouchableOpacity, Dimensions, FlatList, Image, StatusBar, ImageBackground, StyleSheet, Animated, Platform, ScrollView } from 'react-native'
import {SafeAreaView} from "react-navigation"
import { Badge, Button } from 'react-native-elements'
import analytics from '@react-native-firebase/analytics'
import { EventRegister } from 'react-native-event-listeners'
import rootView from 'react-native-root-view'
import Icon from 'react-native-vector-icons/Ionicons'
import { connect } from 'react-redux'
import dayjs from 'dayjs'

import { SideBar } from "../../components"
import { BackImg, SearchImg, MirrorImg, PlayImg } from "../../common/ImgConfig"
import WebAPI from "../../service"
import { PageStatusColor } from "../../common/BaseContent"
import Screen from '../rootwindow/index'
import Player from './MusicPlayer'
import { setPlayId, setPlaySong, setPlayList } from '../../redux/actions/'
import { screenW, screenH } from "../../utils/utils"

const iwidth = Dimensions.get("window").width
const iheight = Dimensions.get("window").height
const height = Platform.OS === 'ios' ? iheight : screenH
const width = Platform.OS === 'ios' ? iwidth : screenW
// const { width, height } = Dimensions.get("window")

export default class SingleList extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: navigation.state.params.playlist[navigation.state.params.currentIndex].title,
      headerLeft: (
        <Button
          onPress={() => navigation.goBack()}
          buttonStyle={{marginLeft: width * 0.02}}
          icon={
            <Icon
              name="ios-arrow-back"
              size={25}
            />
          }
          type="clear"
        />
      )
    }
  }

  constructor(props: any) {
    super(props);

    this.state = {
      bgColor: PageStatusColor.music,
      playlist: this.props.navigation.state.params.playlist,
      currentIndex: this.props.navigation.state.params.currentIndex,
      isShowAll: false
    }
  }

  componentWillMount () {
    this.HttpMusic  = new WebAPI();
    this.listener = EventRegister.addEventListener('currentIndex', (data) => {
            this.setState({
              currentIndex: data
            })
            this.props.navigation.setParams({
              currentIndex: data
            })
        })
    // console.log()
    // const id = this.props.navigation.getParam('id')
    // const id = this.props.navigation.state.params.id
    // this.getMusicList(id);
  }

  componentWillUnmount() {
      EventRegister.removeEventListener(this.listener)
  }

  // getMusicList = (id) => {
  //   console.log(id)
  //   this.HttpMusic.getMusicDetailList(id)
  //     .then(res => {
  //       this.setState({
  //         playlist: res._items
  //       })
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     })
  // }

  // setcurrentIndex = async () => {
  //   await global.storage
  //   .load({ key: 'currentIndex' })
  //   .then(data => this.state.currentIndex = data)
  //   await this.setState({
  //     currentIndex: this.state.currentIndex
  //   })
  // }

  onPress = async (i, id, name, picUrl) => {
    // this.setState({
    //   img: this.state.playlist[this.state.currentIndex].heroImage
    // })
    // await this.props.dispatch(setPlayId({id}))
    // await this.props.dispatch(setPlaySong({i}))
    // await this.props.dispatch(setPlayList(this.state.playlist))
    // await this.props.navigation.navigate('MusicPlayer')
    // const playlist = [];
    //   this.state.playlist.forEach(item => {
    //         playlist.push(item);
    //     })
    //     this.setState({
    //       // playlist: playlist,
    //       currentIndex: i
    //     })

    // tracking
    await analytics().logEvent('app_other_album_of_author', {
      item_id: id
    })

    this.setState({
      currentIndex: i
    })
    this.props.navigation.setParams({
      currentIndex: i
    })
    await rootView.remove()
    await rootView.set(
        <Screen close={this.close} FloatImage={picUrl} toFloat >
          <Player
          currentIndex={i}
          id={id}
          playlist={this.state.playlist}
          ></Player>
        </Screen>
      )
    // await rootView.set(
    //   <Screen close={this.close} FloatImage={picUrl} toFloat >
    //     {this.props.navigation.navigate('MusicPlayer')}
    //   </Screen>
    // )
  }
  close = () => {
    rootView.remove()
  }

  singleMusic = (item, i) => {
    const { playlist, currentIndex } = this.state;
    const name = item.title;
    const img = playlist[currentIndex].heroImage;
    const styles = singleMusicStyles;
    return <TouchableOpacity
        activeOpacity={1}
        // onPress={() => this.props.navigation.navigate('MusicPlayer', {id: item._id, name: item.title, music_url: item.audio.url, picUrl: "https://is4-ssl.mzstatic.com/image/thumb/Purple118/v4/6d/98/47/6d984774-08aa-0457-c1a6-83350fe399ed/AppIcon-0-1x_U007emarketing-0-0-GLES2_U002c0-512MB-sRGB-0-0-0-85-220-0-0-0-10.png/1000x0w.jpg"})}
        onPress={() => this.onPress(i, item._id, name, img)}>
      <View style={styles.container}>
        <View style={styles.numContainer}>
          <Text style={{color: '#7d7d7d'}}>
            { playlist.length - i }
          </Text>
        </View>
        <View style={styles.musicContainer}>
          <View style={styles.musicTextContainer}>
            <Text style={styles.musicTitle} numberOfLines={2}>
              {name}
            </Text>
            {/* <Text style={styles.musicSubTitle} numberOfLines={1}>{`${author} - ${item.name}`}</Text> */}
          </View>
          <View style={styles.musicIconContainer}>
          <Text style={{color: "#7d7d7d"}}>{dayjs(item.publishedDate).format('MM-DD')}</Text>
            {/* <Image source={PlayImg} style={singleMusicStyles.musicImg} /> */}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  } 

  render () {
    const { currentIndex, playlist, isShowAll } = this.state
    const img = playlist[currentIndex].heroImage;

    //console.log(playlist[currentIndex])

    let writer = playlist[currentIndex].writers
    ? (playlist[currentIndex].writers.map((writer, i) => {
      return <Text key={i}>
        {writer.name}{' '}
      </Text>
    }))
    : ""
    let vocal = playlist[currentIndex].vocals
    ? (playlist[currentIndex].vocals.map((vocal, i) => {
        return <Text key={i}>
          {vocal.name}{' '}
        </Text>
      }))
    : ""

    // 取出 content.content[0], 做文字分段整合
    let content = '無內容'

    if (playlist[currentIndex].content) {
      // 取出所有需要的 content array
      let content_array = playlist[currentIndex].content.apiData.map((content, i) => {
          if (content.content[0] && typeof content.content[0] !== 'object') {
            return content.content[0]
          }
        })

      // 過濾
      let filtered_array = content_array.filter(function(el) {
        if (el != undefined && el != null && el != '') {
          return el.trim()
        }
      })

      // replace (最後才做，以免ㄤ html 無法濾除)
      if (filtered_array.length > 0) {
        content = filtered_array.join('\n\n').replace(/<[^>]+>/gm, '')
      }
    }

    return (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            {/* <SideBar
              backgroundColor={bgColor}
              title={playlist.title}
              leftImg={BackImg}
              onLeftPress={() => this.props.navigation.goBack()} /> */}
              <View style={styles.bg}/>
              <Image source={img ? { uri: img.image.url } : MirrorImg} resizeMode="cover" style={styles.bg} blurRadius={15} />
              <View style={{flex: 1, marginHorizontal: 35, marginVertical: 20, backgroundColor: 'transparent'}}>
                  <View style={{flex: 1}}>
                      <Text style={{fontSize: height * 0.025, lineHeight: height * 0.03, paddingBottom: height * 0.020, color:"white"}} numberOfLines={2}>{playlist[currentIndex].title}</Text>
                      {/* <Text style={{fontSize: height * 0.018, color:"white"}} numberOfLines={1}>主播：{vocal}  原著：{writer}</Text> */}
                      <View style={{marginTop: 10, marginLeft: 3, flexDirection: 'row', alignItems: "center"}}>
                        <Icon name="md-refresh" size={height * 0.017} color="#fff" />
                        <Text style={{fontSize: height * 0.017, color: "#fff", marginLeft: 5}}>{dayjs(playlist[currentIndex].publishedDate).format('YYYY-MM-DD')}</Text>
                      </View>
                  </View>
              </View>
          </View>
          <View style={styles.list}>
            <View style={[styles.info, {backgroundColor: "#fff"}]}>
              {/* <HtmlText style={styles.textStyle} html={content.replace(',', "")}></HtmlText> */}
              <Text style={styles.textStyle} numberOfLines={isShowAll ? 2000 : 2}>{content}</Text>
              { 
                isShowAll === false
                ? <View style={styles.infotextContainer}>
                      <Icon name="md-arrow-dropdown" size={20} onPress={()=>{this.setState({isShowAll:true})}} />
                  </View>
                : <View style={styles.infotextContainer}>
                      <Icon name="md-arrow-dropup" size={20} onPress={()=>{this.setState({isShowAll:false})}} />
                  </View>
              }
            </View>
              { 
                playlist.length === 0
                ? <View
                    style={styles.listPlayAll}>
                    <Text style={styles.PlayAllText}>列表內無歌曲</Text>
                  </View>
                : <View
                    style={styles.listPlayAll}>
                    <Text style={styles.PlayAllText}>同專輯的其他單曲</Text>
                  </View>
              }
              <FlatList
                style={styles.listcontainer}
                data={playlist}
                renderItem={({item, index}) => this.singleMusic(item, index)}
                keyExtractor={(item, index) => item + index}
              />
          </View>
        </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeeee'
  },
  imgContainer: {
    width: 101,
    height: 103,
    borderRadius: 3
  },
  listcontainer: {
    backgroundColor: '#fff',
    // marginHorizontal: 12
  },
  header: {
    flex: .2,
  },
  info: {
    padding: 15,
    marginBottom: 15,
    borderColor: 'rgba(0,0,0,0.1)',
    borderWidth: 1,
    borderRadius: 3,
  },
  list: {
    flex: .8,
    marginHorizontal: 12
  },
  listPlayAll: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    paddingVertical: 17,
    borderRadius: 2,
    borderBottomColor: 'rgba(216,216,216,0.3)',
    borderBottomWidth: 2,
    backgroundColor: "#fff"
  },
  PlayAllText: {
    fontSize: 16,
    paddingLeft: 5
  },
  titleStyle: {
    fontSize: 14,
    color: '#9d9d9d',
    marginBottom: 10
  },
  textStyle: {
    fontSize: 14,
    lineHeight: 24,
    color: '#000'
  },
  infotextContainer: {
    alignItems: "center",
    // position: 'absolute',
    bottom: -10,
    // right: 190
  },
  bg: {
    // flex: .3,
    position: 'absolute',
    opacity: 0.75,
    height: height / 3,
    // height: width * 0.6,
    width: width,
    top: - height / 18, 
    // height: width * 0.6 + 50, 
    backgroundColor: '#000'
  },
})

const singleMusicStyles = StyleSheet.create({
  container: { 
    height: 60,
    flexDirection: 'row'
  },
  numContainer: {
    width: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomColor: 'rgba(216,216,216,0.3)',
    borderBottomWidth: 2,
    marginLeft: 10,
    alignItems: 'center'
  },
  musicContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: 'rgba(216,216,216,0.3)',
    borderBottomWidth: 2,
    marginRight: 10,
    paddingRight: 10
  },
  musicTextContainer: {
    flex: 1,
    flexDirection: 'column'
  },
  musicTitle: {
    color: '#000'
  },
  musicLink: {
    color: '#888'
  },
  musicSubTitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 3
  },
  musicIconContainer: {
    marginLeft: 5
  },
  musicImg: {
    width: 30,
    height: 30
  }
})

// const mapStateToProps = state => ({
//   state
// })

// export default connect(mapStateToProps)(SingleList);
