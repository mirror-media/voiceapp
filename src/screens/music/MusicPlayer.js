import React from 'react';
import { View, ScrollView, StyleSheet, Text, Image, TouchableOpacity, Dimensions, StatusBar, Animated, Easing, ActivityIndicator, Platform } from 'react-native';
import { Slider } from 'react-native-elements'
import { BackImg, MirrorImg } from "../../common/ImgConfig"
import { SideBar } from "../../components"
import {SafeAreaView} from "react-navigation"
import Video from 'react-native-video'
import { PageStatusColor } from "../../common/BaseContent"
import Icon from 'react-native-vector-icons/FontAwesome'
// import ListPopover from 'react-native-list-popover'
import { EventRegister } from 'react-native-event-listeners'
import ActionSheet from 'react-native-actionsheet'
import MusicControl from 'react-native-music-control'
import { connect } from 'react-redux'
import { setPlayId, setPlaySong, setPlayList, setMusicPause } from '../../redux/actions'

import { screenW, screenH } from "../../utils/utils"
const iwidth = Dimensions.get("window").width
const iheight = Dimensions.get("window").height
const height = Platform.OS === 'ios' ? iheight : screenH
const width = Platform.OS === 'ios' ? iwidth : screenW
const items = ['關閉', '2.0', '1.5', '1.0', '0.75', '0.5'];
// const { width, height } = Dimensions.get("window")
// const screenW2 = width - 90

export default class MusicPlayer extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      header: null
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      activeIndex: 0,
      initHeight: 0,
      lastTime: '0',
      playMode: 0,
      bgColor: PageStatusColor.music,
      pause: false,
      startTime: '00:00',

      // 目前秒數 float
      currentTime: 0,
      currentIndex: 0,

      // 目前秒數 integer
      sliderValue: 0,
      rotateValue: new Animated.Value(0),
      minimumTrackTintColor: PageStatusColor.music,
      maximumTrackTintColor: "#cccccc",
      thumbTintColor: "#fff",
      rated: "1.0",
      history: [],
      historyInterval: null
      // isVisible: false
    }
  }

  componentWillMount () {
    // console.log(this.props.state)
    const currentIndex = this.props.currentIndex
    const id = this.props.id
    // const name = this.props.name
    // const playlist = this.props.playlist
    this.startAnimation();
    this.setState({
      currentIndex: currentIndex
    })
    MusicControl.updatePlayback({
      state: MusicControl.STATE_PLAYING,
    })

    global.storage
      .load({ key: 'history' })
      .then(data => {
        this.setState({history: JSON.parse(data)})
      })
      .catch(err => console.log(err.message))
    
    this.state.historyInterval = setInterval(() => {
      this.saveHistory()
    }, 1000)
  }

  async componentDidMount() {
    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('nextTrack', true);
    MusicControl.enableControl('previousTrack', true);
    MusicControl.enableBackgroundMode(true);
    MusicControl.on('play', ()=> {
      this.onPause(false);
    });
    MusicControl.on('pause', ()=> {
      this.onPause(true);
    });
    MusicControl.on('nextTrack', ()=> {this.nextSong(this.state.currentIndex - 1)});
    MusicControl.on('previousTrack', ()=> {this.preSong(this.state.currentIndex + 1)});
  }

  componentWillUnmount() {
    clearInterval(this.state.historyInterval)
  }
  
  setHistory = (eDuration) => {
    setTimeout(() => {
      let tmpData = this.state.history
      const tmpIndex = tmpData.findIndex(item => item.id === this.props.playlist[this.state.currentIndex]._id)
      if (tmpIndex > -1) {
        const tmpHistory = this.state.history[tmpIndex]
        tmpData.splice(tmpIndex, 1)
        tmpData.unshift(tmpHistory)
        if (eDuration - tmpHistory.second > 5) {
          this.refs.video.seek(tmpHistory.second)
        }
        this.setState({history: tmpData, sliderValue: tmpHistory.second})
      } else {
        if (tmpData.length > 19) {
          tmpData.pop()
        }
        tmpData.unshift({id: this.props.playlist[this.state.currentIndex]._id, second: 0})
        this.setState({history: tmpData})
      }
    }, 200)
  }
  
  saveHistory = () => {
    if (this.state.history.length > 0) {
      const tmpId = this.props.playlist[this.state.currentIndex]._id
      const tmpHistory = this.state.history
      if (tmpHistory[0] && tmpHistory[0].id === tmpId) {
        tmpHistory[0].second = this.state.sliderValue
        global.storage.save({
          key: 'history',
          data: JSON.stringify(tmpHistory)
        })
      }
    }
  }

  onLoad = (e) => {
    this.setState({
      duration: e.duration
    })
    let song = this.props.playlist[this.state.currentIndex]
    MusicControl.setNowPlaying({
      title: song.title,
      artwork: song.heroImage ? song.heroImage.image.url : MirrorImg,
      duration: e.duration
    });
    this.setHistory(e.duration)
  }

  onEnd(data) {
    if (this.state.playMode === 0) {
      this.nextSong(this.state.currentIndex - 1)
    } else {
      this.nextSong(Math.floor(Math.random() * this.props.playlist.length))
    }
  }

  onProgress =(data) => {
    let val = parseInt(data.currentTime)
    this.setState({
      sliderValue: val,
      currentTime: data.currentTime
    })

    if (val == this.state.file_duration){
    }
  }

  onPause = (pause) => {
    this.setState({pause: pause})
    MusicControl.updatePlayback({
      state: pause ? MusicControl.STATE_PAUSED: MusicControl.STATE_PLAYING,
    })
    // this.props.dispatch(setMusicPause({pause}))
  }

  formatTime = (time) => {
    if (!time) return this.state.startTime;
    let min = Math.floor(time / 60)
    let second = time - min * 60
    min = min >= 10 ? min : '0' + min
    second = second >= 10 ? second : '0' + second
    return min + ':' + second
  }

  nextSong = async (currentIndex) => {
    const playlist = this.props.playlist
    this.reset()
    this.setState({currentIndex: currentIndex < 0 ? playlist.length - 1 : currentIndex})
    EventRegister.emit('currentIndex', currentIndex < 0 ? playlist.length - 1 : currentIndex)
  }
  preSong = async (currentIndex) => {
    const playlist = this.props.playlist
    this.reset()
    this.setState({currentIndex: currentIndex >= playlist.length ? 0 : currentIndex})
    EventRegister.emit('currentIndex', currentIndex >= playlist.length ? 0 : currentIndex)
  }

  reset() {
    this.setState({
      currentTime: 0.00,
      sliderValue: 0,
      musicInfo: {}
    })
  }

  showActionSheet = () => {
    this.ActionSheet.show()
  }

  startAnimation() {
    this.state.rotateValue.setValue(0);
    Animated.parallel([
      Animated.timing(this.state.rotateValue, {
          toValue: 1,
          duration: 15000,
          easing: Easing.out(Easing.linear)
      }),
    ]).start(() => this.startAnimation());
  }

  renderPlay = () => {
    const { startTime, currentTime, sliderValue, duration, minimumTrackTintColor, maximumTrackTintColor, thumbTintColor } = this.state;
    const styles = playStyles;
    
    return <View style={styles.container}>
      <View style={styles.sliderContainer}>
      <View style={{flex:5,flexDirection: 'row'}}>
          <Text style={styles.timeStyle}>{this.formatTime(Math.floor(currentTime))}</Text>
          {
            this.formatTime(Math.floor(duration)) === startTime
            ? <ActivityIndicator size="small" color="#fff" /> 
            : <Text style={styles.lasttimeStyle}>/{this.formatTime(Math.floor(duration))}</Text>
          }
      </View>
      <View>
        <TouchableOpacity
          style={styles.listType}
          onPress={this.showActionSheet}>
          <Text style={{color: 'white', fontSize: height * 0.018, textAlign: 'center'}}>X{this.state.rated}</Text>
        </TouchableOpacity>
        <ActionSheet
          ref={o => this.ActionSheet = o}
          title={'請選擇播放速度'}
          options={items}
          cancelButtonIndex={0}
          destructiveButtonIndex={3}
          onPress={(index) => index ? this.setState({rated: items[index]}) : {}}
        />
      </View>
      </View>
      <View style={{height: 10}} />
      <View style={styles.sliderContainer}>
        <View style={styles.sliderStyle}>
          <Slider
            value={sliderValue}
            maximumValue={duration}
            step={1}
            minimumTrackTintColor={minimumTrackTintColor}
            maximumTrackTintColor={maximumTrackTintColor}
            thumbTintColor={thumbTintColor}
            onValueChange={(value) => {this.setState({currentTime: value})}}
            onSlidingComplete={(value) => this.refs.video.seek(value)}
          />
        </View>
      </View>
      {
        height > 570
        ? <View style={{height: height * 0.06}} />
        : <View />
      }
      <View style={styles.statusContainer}>
        <TouchableOpacity
          onPress={() => this.preSong(this.state.currentIndex + 1)}>
          <Icon name="step-backward" size={height * 0.04} color={"white"} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.onPause(!this.state.pause)}>
          {
            this.state.pause
            ? <Icon name="play" size={height * 0.07} color={"white"} />
            : <Icon name="pause" size={height * 0.07} color={"white"} />
          }
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.nextSong(this.state.currentIndex - 1)}>
          <Icon name="step-forward" size={height * 0.04} color={"white"} />
        </TouchableOpacity>
      </View>
    </View>
  }

  render () {
    const { picUrl, mp3, bgColor, pause, rotateValue, rated, currentIndex } = this.state;
    const playlist = this.props.playlist
    let musicInfo = playlist[currentIndex]
    let writer = musicInfo.writers
    ? (musicInfo.writers.map((writer, i) => {
      return <Text key={i}>
        {writer.name}{' '}
      </Text>
    }))
    : ""
    let vocal = musicInfo.vocals
    ? (musicInfo.vocals.map((vocal, i) => {
        return <Text key={i}>
          {vocal.name}{' '}
        </Text>
      }))
    : ""

    const title = musicInfo.title
    const music_wav = "https://www.mirrormedia.mg/assets/audios/{id}.wav".replace('{id}', musicInfo._id)
    const music = musicInfo.audio.audio.url
    //console.log(music)
    EventRegister.emit('image', musicInfo.heroImage)
    EventRegister.emit('pause', pause)
    // const picUrlx = musicInfo.coverPhoto ? musicInfo.coverPhoto.image.url : 'https://is4-ssl.mzstatic.com/image/thumb/Purple118/v4/6d/98/47/6d984774-08aa-0457-c1a6-83350fe399ed/AppIcon-0-1x_U007emarketing-0-0-GLES2_U002c0-512MB-sRGB-0-0-0-85-220-0-0-0-10.png/1000x0w.jpg'
    return (
      <View style={[styles.container]}>
        <View style={{flex:1}}>
          <Video
            source={{uri: music}}
            rate={parseFloat(rated)}
            ref='video'
            volume={1.0}
            paused={pause}
            onProgress={(e) => this.onProgress(e)}
            onLoad={(e) => this.onLoad(e)}
            onEnd={(data) => this.onEnd(data)}
            ignoreSilentSwitch={"ignore"}
            playInBackground={true}/>
          <View style={styles.recordContainer}>
            <View style={styles.recordWrapContainer}>
              <Image source={musicInfo.heroImage ? { uri: musicInfo.heroImage.image.url } : MirrorImg} style={styles.record}>
              </Image>
            </View>
            <View style={{width: width - 100, flexDirection: 'row'}}>
              <Text style={styles.title} numberOfLines={2}>{title}</Text>
            </View>
            {/* <SideBar title={title} /> */}
            {
              height > 570
              ? (<View style={{width: width - 100, marginTop: height * 0.015}}>
              <Text style={{fontSize: height * 0.018, color:"#fff"}} numberOfLines={1}>主播：{vocal}</Text>
              {/* <Text style={{marginTop: height * 0.005, fontSize: height * 0.018, color:"#fff"}} numberOfLines={1}>原著：{writer}</Text> */}
            </View>)
              : <View />
            }
          {this.renderPlay()}
          </View>
          <View style={styles.emptyContainer} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  recordContainer: {
    flex: 1,
    alignItems: 'center',
  },
  recordWrapContainer: {
    width: width * 0.7,
    height: width * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  record: {
    width: width * 0.55,
    height: width * 0.55,
  },
  emptyContainer: {
    height: height * 0.06
  },
  title: {
    fontSize: height * 0.025,
    fontWeight: 'bold',
    color: '#ffffff'
  }
});

const playStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    width: width - 90,
    flexDirection: 'column'
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    marginHorizontal: 5
  },
  timeStyle: {
    fontSize: 15,
    color: '#fff'
  },
  lasttimeStyle: {
    fontSize: 15,
    color: '#fff'
  },
  sliderStyle: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 10
  },
  button: {
    justifyContent:'space-between'
  },
  record: {
    width: 210,
    height: 210,
  },
  listType: {
    height: height * 0.04,
    width: height * 0.08,
    // paddingHorizontal: height * 0.02,
    paddingVertical: height * 0.008,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 15,
    justifyContent: "center",
  },
})

// const mapStateToProps = state => ({
//   currentIndex: state.currentPlay.i,
//   id: state.currentPlay.id,
//   playlist: state.currentPlayList,
//   state
// })

// export default connect(mapStateToProps)(MusicPlayer);
