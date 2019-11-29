import React from 'react'
import { View, Text, TouchableOpacity, Dimensions, FlatList, Image, StatusBar, ImageBackground, StyleSheet, Animated, Platform, ScrollView } from 'react-native'
import {SafeAreaView} from "react-navigation"
import { Badge, Button } from 'react-native-elements'
import analytics from '@react-native-firebase/analytics'
import { SideBar } from "../../components"
import { BackImg, SearchImg, MirrorImg, PlayImg } from "../../common/ImgConfig"
import WebAPI from "../../service"
import { DotsLoader } from 'react-native-indicator'
import { PageStatusColor } from "../../common/BaseContent"
import Screen from '../rootwindow/index'
import rootView from 'react-native-root-view'
import Player from './MusicPlayer'
import Icon from 'react-native-vector-icons/Ionicons'
import dayjs from 'dayjs'
import { setPlayId, setPlaySong, setPlayList } from '../../redux/actions/'
import { connect } from 'react-redux'
import { screenW, screenH } from "../../utils/utils"
const iwidth = Dimensions.get("window").width
const iheight = Dimensions.get("window").height
const height = Platform.OS === 'ios' ? iheight : screenH
const width = Platform.OS === 'ios' ? iwidth : screenW
// const { width, height } = Dimensions.get("window")

export default class MusicList extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: navigation.state.params.name,
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
      writer: this.props.navigation.state.params.writer,
      vocal: this.props.navigation.state.params.vocal,
      res: "",
      playlist: [],
      isShowAll: false
    }
  }

  componentWillMount () {
    this.HttpMusic  = new WebAPI();
    // console.log(navigation.state.params.refresh_parent)
    // const id = this.props.navigation.getParam('id')
    const id = this.props.navigation.state.params.id
    this.getMusicList(id);
  }

  getMusicList = (id) => {
    this.HttpMusic.getMusicDetailList(id)
      .then(res => {
        this.setState({
          res: res,
          playlist: res._items
        })
      })
      .catch(error => {
        console.log(error);
      })
  }

  onPress = async (i, id, name, playlist, item) => {

    if (id === 0) {
      await analytics().logEvent('app_album', {
        album: item._id,
        event: 'play all'
      })
    } else {
      await analytics().logEvent('app_album', {
        album: id,
        event: 'album'
      })
    }

    global.storage.save({
      key: 'album',
      data: this.props.navigation.state.params.id
    })
    // await this.props.dispatch(setPlayId({id}))
    // await this.props.dispatch(setPlaySong({i}))
    // await this.props.dispatch(setPlayList(this.state.playlist))
    // await this.props.navigation.navigate('MusicPlayer')
    await rootView.remove()
    await rootView.set(
        <Screen close={this.close} toFloat key={id+i}>
          <Player
          currentIndex={playlist.length - 1 - i}
          id={id}
          playlist={this.state.playlist}
          ></Player>
        </Screen>
      )
    this.props.navigation.navigate('SingleList', {id: item._id, title: item.title, img: item.heroImage, content: item.content, playlist: playlist, currentIndex: playlist.length - 1 - i})
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
    const { bgColor, playlist } = this.state;
    const name = item.title;
    // const author = item.title;
    // const audio = item.audio.url;
    alia = item.title;
    const styles = singleMusicStyles;
    const targetIndex = playlist.length - i

    return <TouchableOpacity
        activeOpacity={1}
        // onPress={() => this.props.navigation.navigate('SingleList', {id: item._id, img: item.heroImage, content: item.brief, playlist: playlist, currentIndex: i})}>
        onPress={() => this.onPress(targetIndex - 1, item._id, name, playlist, item)}>
      <View style={styles.container}>
        <View style={styles.numContainer}>
          <Text style={{color: '#7d7d7d'}}>
            { targetIndex }
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
    const { bgColor, playlist, isShowAll, writer, vocal, res } = this.state
    // console.log(playlist)
    // const content = this.props.navigation.state.params.content ?
    // `${this.props.navigation.state.params.content.apiData.map((content, i) => {
    //     return content.content[0]
    //   })}` : "無內容"
    const content = this.props.navigation.state.params.content ?
    `${this.props.navigation.state.params.content.apiData.map((content, i) => {
        if (content.content[0] && typeof content.content[0] !== 'object') {
          return content.content[0] + '\n\n'
        }
      })}` : ""
    // const { title, coverImgUrl, audio } = playlist;

    return (
      // <React.Fragment>
        // <SafeAreaView style={{flex: 0, backgroundColor: '#eeeeee'}}/>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            {/* <SideBar
              backgroundColor={bgColor}
              title={playlist.title}
              leftImg={BackImg}
              onLeftPress={() => this.props.navigation.goBack()} /> */}
              <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 12, marginVertical: height * 0.017, backgroundColor: 'transparent'}}>
                <View>
                  <View style={{width: height * 0.14, height: height * 0.14}}>
                      <Image source={this.props.navigation.state.params.img ? { uri: this.props.navigation.state.params.img.image.url } : MirrorImg} style={{width: '100%', height: '100%'}}/>
                  </View>
                </View>
                <View style={{flex:1, marginHorizontal: height * 0.017}}>
                    <Text style={{fontSize: height * 0.025, lineHeight: height * 0.03, paddingBottom: height * 0.020}} numberOfLines={2}>{this.props.navigation.state.params.name}</Text>
                    <Text style={{fontSize: height * 0.017, color:"#7d7d7d"}} numberOfLines={1}>主播：{vocal}</Text>
                    {/* <Text style={{marginTop: height * 0.004, fontSize: height * 0.017, color:"#7d7d7d"}} numberOfLines={1}>原著：{writer}</Text> */}
                    <View style={{marginTop: height * 0.004, marginLeft: height * 0.003, flexDirection: 'row', alignItems: "center"}}>
                      <Icon name="md-refresh" size={height * 0.017} color="#7d7d7d" />
                      <Text style={{fontSize: height * 0.017, color: "#7d7d7d", marginLeft: 5}}>{dayjs(playlist.publishedDate).format('YYYY-MM-DD')}</Text>
                    </View>
                </View>
              </View>
          </View>
          
          <View style={styles.list}>
          
          {content
          ?<View style={[styles.info, {backgroundColor: "#fff"}]}>
            <Text style={styles.textStyle} numberOfLines={isShowAll ? 10 : 3}>{content}</Text>
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
          :<View/>
          }
            { 
              !res
              ? <View
                  style={[styles.listPlayAll,{borderColor:"#273947", backgroundColor:"#273947", flexDirection: 'row', alignItems: "center"}]}>
                  <Icon name="md-square" size={20} color={"white"} />
                  <Text style={styles.PlayAllText}>載入中</Text>
                  <View style={{marginLeft:10}}>
                    <DotsLoader size={10} color={"white"} />
                  </View>
                </View>
              : playlist.length === 0
              ? <View
                  style={[styles.listPlayAll,{borderColor:"#273947", backgroundColor:"#273947", flexDirection: 'row', alignItems: "center"}]}>
                  <Icon name="md-square" size={20} color={"white"} />
                  <Text style={styles.PlayAllText}>列表內無歌曲</Text>
                </View>
              : <TouchableOpacity
                  style={styles.listPlayAll}
                  onPress={() => this.onPress(0, 0, 0, playlist, this.props.navigation.state.params.img)}>
                  <Icon name="md-play" size={20} color={"white"} />
                  <Text style={styles.PlayAllText}>全部播放（{playlist.length}）</Text>
                </TouchableOpacity>
            }
            <FlatList
              style={styles.listcontainer} 
              data={playlist}
              renderItem={({item, index}) => this.singleMusic(item, index)}
              keyExtractor={(item, index) => item + index}
            />
          </View>
        </ScrollView>
      // </React.Fragment>
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
    // marginHorizontal: 12
  },
  info: {
    // marginTop: 2,
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
    // marginHorizontal: 12,
    paddingHorizontal: 25,
    paddingVertical: 17,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: PageStatusColor.music,
    backgroundColor: PageStatusColor.music
  },
  PlayAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
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
  }
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

// export default connect(mapStateToProps)(MusicList);
