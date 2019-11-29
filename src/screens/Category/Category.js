import React, { Component } from 'react'
import { Platform, StyleSheet, Text, View, ImageBackground, Dimensions } from 'react-native'
import { TabView, TabBar, SceneMap } from 'react-native-tab-view'
import { PageStatusColor } from "../../common/BaseContent"
import { Badge, Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/Ionicons'

import CategoryInfo from './CategoryInfo'

const { width } = Dimensions.get("window")

export default class Category extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: "分類",
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

  constructor(props) {
    super(props)

    const routes = this.props.navigation.state.params.tabs.map(element => {
      return {...element, navigation: this.props.navigation}
    })

    this.state = {
      index: this.props.navigation.state.params.index,
      routes: routes
    }
  }

  componentDidMount = () => {
  }
  _renderTabBar = props => {
    return (
      <TabBar
        scrollEnabled={true}
        tabStyle={{width: 'auto'}}
        {...props}
        indicatorStyle={{ backgroundColor: PageStatusColor.music }}
        style={{ backgroundColor: PageStatusColor.music, height: 50 }}
        renderLabel={({ route }) => (
          <View>
              <Text style={{textAlign: 'center', color: "#fff",
                margin: route.key === props.navigationState.routes[props.navigationState.index].key ? 7 : 8,
                fontSize: route.key === props.navigationState.routes[props.navigationState.index].key ? 17 : 13,
                }}>
                  {route.title}
              </Text>
          </View>
        )}
      />
    )
  }
  render() {
    const tabSceneMap = {}
    this.props.navigation.state.params.tabs.forEach(element => {
      tabSceneMap[element.key] = CategoryInfo
    })

    return (
      // <ScrollView>
      <TabView
        navigationState={this.state}
        renderTabBar={this._renderTabBar}
        renderScene={SceneMap(tabSceneMap)}
        onIndexChange={index => this.setState({ index })}
      />
      // </ScrollView>
    )
  }
}
