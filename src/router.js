import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'

import IndexScreen from './screens/index'
import rootwindow from './screens/rootwindow'
import { RankingList, MusicPlayer, MusicList, SingleList,  Demo, Category, CategoryInfo } from "./screens"


RouterStack = createStackNavigator({
  RankingList,
  MusicPlayer,
  MusicList,
  SingleList,
  Category,
  CategoryInfo,
  rootwindow
}, {
  initialRouteName: 'RankingList'
})

exports.Router = createAppContainer(RouterStack)
