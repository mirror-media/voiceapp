import React, { PureComponent } from 'react'
import { Text, View, FlatList, TouchableOpacity, StyleSheet, List, ListItem, Image, Dimensions, ScrollView, StatusBar } from 'react-native'
import { Button, Divider, SearchBar } from 'react-native-elements'
import Icon from 'react-native-vector-icons/Ionicons'
import analytics from '@react-native-firebase/analytics'
import { MusicBarLoader } from 'react-native-indicator'
import { NavigationEvents } from 'react-navigation'
import dayjs from 'dayjs'
import _ from 'lodash'

import { MirrorImg, PlayImg } from "../../common/ImgConfig"
import { PageStatusColor } from "../../common/BaseContent"
import WebAPI from '../../service'

const { width, height } = Dimensions.get("window")
export default class CategoryInfo extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      dataSource: [],
      itemlist: [],
      recommendList: [],
      cateid: "",
      albumid: "",
      isShowAll: false,
      id: props.route.key,
      rankid: props.route.key,
      fHeight: 0
    }
  }

  componentWillMount() {
    this.HttpMusic = new WebAPI()
    global.storage
      .load({ key: 'album' })
      .then(data => this.state.albumid = data)
      .catch(err => console.log(err.message))
    this.getItemList(this.state.rankid)
    this.getRankingList(this.state.rankid, 50)
  }

  onFocus = async () => {
    await global.storage
      .load({ key: 'album' })
      .then(data => this.state.albumid = data)
    await this.state.cateid === this.state.rankid
      ? this.getRankingList(this.state.rankid, 50)
      : this.getMusicList(this.state.cateid)
  }

  layout = (e) => {
    this.setState({
      fHeight: e.layout.height
    })
  }

  getItemList = (id) => {
    this.HttpMusic.getMusicSectionListById(id)
      .then(res => {
        this.setState({
          itemlist: res.categories
        })
      })
      .catch(error => {
        console.log(error);
      })
  }

  getMusicList = async (id, sort) => {

    await analytics().logEvent('app_listing', {
      category: id
    })

    if (id === this.state.cateid) {
      const recommendList = [];
      this.state.recommendList.forEach(item => {
        recommendList.push(item);
      })
      this.setState({
        recommendList: recommendList
      })
    } else {
      this.setState({
        cateid: id
      })
      this.HttpMusic.getMusicCateList(id, sort)
        .then(res => {
          const recommendList = [];
          res._items.forEach(item => {
            // console.log(item)
            recommendList.push(item);
          })
          this.setState({
            recommendList: recommendList
          })
        })
        .catch(error => {
          console.log(error);
        })
    }
  }

  getRankingList = (id, results) => {
    if (id === this.state.cateid) {
      const recommendList = [];
      this.state.recommendList.forEach(item => {
        // console.log("recommenditem:",item)
        recommendList.push(item);
      })
      this.setState({
        recommendList: recommendList
      })
    } else {
      this.setState({
        cateid: id
      })
      this.HttpMusic.getMusicRankingList(id, results)
        .then(res => {
          const recommendList = [];
          res._items.forEach(item => {
            // console.log(item)
            recommendList.push(item);
          })
          this.setState({
            recommendList: recommendList
          })
        })
        .catch(error => {
          console.log(error);
        })
    }
  }

  // to music list (album)
  navigateToMusicList = async (obj) => {
    await analytics().logEvent('app_listing', {
      album: obj.id
    })

    this.props.route.navigation.navigate('MusicList', obj)
  }

  renderItem = ({ item }) => {
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

    return (
      <TouchableOpacity onPress={() => this.navigateToMusicList({ id: item._id, name: item.name, img: item.heroImage, content: item.content, writer: musicWriter, vocal: musicVocal })} style={styles.touch_item} >
        <View style={[styles.listContainer]}>
          <View style={styles.imgContainer}>
            <Image source={item.heroImage ? { uri: item.heroImage.image.resizedTargets.mobile.url } : MirrorImg} style={styles.imgContainer} />
            <View style={[styles.FloatPosition, styles.FloatBtn]}>
              <View style={styles.FloatImage} />
              <View>
                {
                  this.state.albumid === item._id
                    ? <MusicBarLoader barWidth={4} barHeight={16} betweenSpace={1} color={"#d84939"} />
                    : <Icon name="ios-play" size={25} color={"#000"} />
                }
              </View>
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text numberOfLines={2} style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemInfo}>{this.singleWriter(item.writers)}</Text>
            <View style={{ marginTop: 5, marginLeft: 10, flexDirection: 'row', alignItems: "center" }}>
              <Icon name="md-refresh" size={15} color="#7d7d7d" />
              <Text style={{ color: "#7d7d7d", marginLeft: 5 }}>{dayjs(item.publishedDate).format('YYYY-MM-DD')}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  render_divider = () => {
    return <View style={{ marginBottom: 9 }} />
  }
  singleWriter = (writers) => {
    const musicWriter = writers.map((writer, i) => {
      return <Text key={i}>
        {writer.name}{' '}
      </Text>
    })
    return musicWriter
  }

  render() {
    const { itemlist, recommendList, cateid, rankid, isShowAll } = this.state
    return (
      <ScrollView>
        <NavigationEvents
          onWillFocus={this.onFocus} />
        <View style={styles.container}>
          <View style={{
            flex: 1,
            marginTop: 15,
            marginLeft: 18,
            marginRight: 18,
          }}>
            <View style={{ height: !isShowAll ? 75 : this.state.fHeight > 110 ? 110 : this.state.fHeight }}>
              <ScrollView>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
                  onLayout={({ nativeEvent: e }) => this.layout(e)}
                >
                  <TouchableOpacity
                    key={"999"}
                    style={cateid === rankid ? styles.listTypeHighlight : styles.listType}
                    onPress={() => { this.getRankingList(rankid, 50) }}
                  >
                    <Text style={[cateid === rankid ? { color: '#fff' } : { color: '#4a4a4a' }, { fontSize: 16 }]}>全部</Text>
                  </TouchableOpacity>
                  {
                    _.map(itemlist, (item, i) => (
                      <TouchableOpacity
                        key={i}
                        style={cateid === item._id ? styles.listTypeHighlight : styles.listType}
                        onPress={() => { this.getMusicList(item._id) }}
                      >
                        <Text style={[cateid === item._id ? { color: '#fff' } : { color: '#4a4a4a' }, { fontSize: 16 }]}>{item.title}</Text>
                      </TouchableOpacity>
                    ))
                  }
                </View>
              </ScrollView>
            </View>
            <View style={{ flex: 1 }}>
              {
                isShowAll === false && this.state.fHeight > 75
                  ? <View style={{ alignItems: "center" }}>
                    <Icon name="md-arrow-dropdown" size={20} onPress={() => { this.setState({ isShowAll: true }) }} />
                  </View>
                  : this.state.fHeight > 75 ?
                    <View style={{ alignItems: "center" }}>
                      <Icon name="md-arrow-dropup" size={20} onPress={() => { this.setState({ isShowAll: false }) }} />
                    </View>
                    : <View />
              }
              <View style={styles.listText}>
                <Text style={{ flex: 5, color: '#7d7d7d', alignItems: "flex-start" }}>共 {this.state.recommendList.length} 則</Text>
                {/* <Text style={{color: '#7d7d7d'}} onPress={()=>{cateid === rankid ? this.getRankingList(rankid,50,"-"):this.getMusicList(cateid,"-")}}>最新</Text>
            <Text style={{color: '#7d7d7d'}}>｜</Text>
            <Text style={{color: '#7d7d7d'}} onPress={()=>{cateid === rankid ? this.getRankingList(rankid,50):this.getMusicList(cateid)}}>最舊</Text> */}
              </View>
              <FlatList
                // style={{height: height-(190+this.state.fHeight)}}
                // scrollEnabled={false}
                data={this.state.recommendList}
                renderItem={this.renderItem}
                ItemSeparatorComponent={this.render_divider}
                keyExtractor={(item, index) => item + index}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeeee',
  },
  imgContainer: {
    position: 'relative',
    width: 100,
    height: 100
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    // justifyContent: 'space-around',
    marginLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 5
  },
  listType: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: PageStatusColor.music,
    borderRadius: 15,
    marginTop: 8,
    backgroundColor: '#fff'
  },
  listTypeHighlight: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 15,
    marginTop: 8,
    borderColor: PageStatusColor.music,
    backgroundColor: PageStatusColor.music
  },
  listText: {
    marginBottom: 9,
    flexDirection: 'row',
  },
  listContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  itemTitle: {
    flex: 0.9,
    fontSize: 17,
    marginTop: 7,
    marginLeft: 10,
    marginRight: 15
  },
  itemInfo: {
    color: "#7d7d7d",
    marginTop: 1,
    marginLeft: 10,
  },
  FloatBtn: {
    height: 100,
    width: 100,
    justifyContent: "center",
    alignItems: "center"
  },
  FloatPosition: {
    position: "absolute",
    left: 0,
    top: 0
  },
  FloatImage: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 50,
    height: 50,
    borderRadius: 2,
  },
})

