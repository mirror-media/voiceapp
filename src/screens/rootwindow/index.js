import React, { PureComponent } from "react";
import {
  StyleSheet,
  Animated,
  Button,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Platform
} from "react-native";
import DragArea from "./dragArea";
import { MirrorImg } from "../../common/ImgConfig"
import rootView from 'react-native-root-view'
import Icon from 'react-native-vector-icons/FontAwesome'
import { EventRegister } from 'react-native-event-listeners'
import { connect } from 'react-redux'
import { Storage } from '../../db/storage'
import { screenW, screenH } from "../../utils/utils"
const iwidth = Dimensions.get("window").width
const iheight = Dimensions.get("window").height
const height = Platform.OS === 'ios' ? iheight : screenH
const width = Platform.OS === 'ios' ? iwidth : screenW
const FloatBallWH = 60;
const rightPosition = width - FloatBallWH - 10;
const leftPosition = 10;
const MinShowDragAreaDistance = 50;


export default class Window extends PureComponent {
  static navigationOptions = {
    header: null
  };

  state = {
    animating: false,
    isOpen: false,
    animateValue: new Animated.Value(0),
    toFloat: this.props.toFloat || false,
    FloatImage:"",
    pause: false,
    translateValue: new Animated.ValueXY({ x: rightPosition, y: 300 }),
    showDragArea: false,
    isInArea: false
  };

  listenerValue = { x: rightPosition, y: 300 };

  lastValueX = rightPosition;
  lastValueY = 300;

  /** ************ Action */
  back = () => {
    // return when is animating
    if (this.state.animating) return;
    // if screen need to be float to window
    if (this.state.toFloat) {
      this.state.isOpen && this.animate(false);
      return;
    }
    this.props.close ? this.props.close() : this.props.navigation.pop();
  };

  open = () => {
    !this.state.isOpen && this.animate(true);
  };

  floatBtnClick = () => {
    !this.state.animating && this.open();
  };

  animate = isOpen => {
    this.setState({ animating: true });
    Animated.parallel([
      Animated.timing(this.state.animateValue, {
        toValue: isOpen ? 1 : 0,
        duration: 500
      }),
      Animated.timing(this.state.translateValue.y, {
        toValue: isOpen ? 0 : this.lastValueY,
        duration: 500
      }),
      Animated.timing(this.state.translateValue.x, {
        toValue: isOpen ? 0 : this.lastValueX,
        duration: 500
      })
    ]).start(() => {
      this.setState({ isOpen: isOpen, animating: false });
    });
  };

  showDragArea = () => {
    !this.state.showDragArea && this.setState({ showDragArea: true });
    if (this.sibling) {
      this.dragArea.show();
    } else {
      this.sibling = rootView.set(
        <DragArea ref={r => (this.dragArea = r)} getArea={this.getArea} />
      );
    }
  };

  hideDragArea = () => {
    this.state.showDragArea && this.setState({ showDragArea: false });
    this.dragArea && this.dragArea.hide();
  };

  getArea = area => {
    this.area = area;
  };

  dragInOrOutArea = isIn => {
    if (isIn) this.dragArea && this.dragArea.inArea();
    else this.dragArea && this.dragArea.outArea();
  };

  /** ************ Life Cycle */
  componentWillMount() {
    this.open();
    this.state.translateValue.addListener(
      value => (this.listenerValue = value)
    );
    this.gestureResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: this.onPanResponderGrant,
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
      onPanResponderTerminate: this.onPanResponderRelease
    });
    this.listener = EventRegister.addEventListener('image', (data) => {
      this.setState({
        FloatImage: data
      })
    })
    this.listener = EventRegister.addEventListener('pause', (data) => {
      this.setState({
        pause: data
      })
    })
  }

  componentWillUnmount() {
    this.sibling && rootView.remove()
    EventRegister.removeEventListener(this.listener)
  }
  /** ************ Responder */
  onPanResponderGrant = (evt, gestureState) => {
    this.time = Date.parse(new Date());
    this.state.translateValue.setOffset(this.listenerValue);
    this.state.translateValue.setValue({ x: 0, y: 0 });
  };

  onPanResponderMove = (evt, gestureState) => {
    Animated.event([
      null,
      {
        dx: this.state.translateValue.x,
        dy: this.state.translateValue.y
      }
    ])(evt, gestureState);
    if (!this.state.showDragArea) {
      const { dx, dy } = gestureState;
      distance = Math.sqrt(
        Math.pow(Math.abs(dx), 2) + Math.pow(Math.abs(dy), 2)
      );
      if (distance > MinShowDragAreaDistance) {
        // this.showDragArea();
        this.hideDragArea();
      }
    }
    this.state.showDragArea &&
      this.isInArea(
        this.state.translateValue.y.__getValue(),
        this.state.translateValue.x.__getValue()
      );
  };

  onPanResponderRelease = (evt, gestureState) => {
    this.state.translateValue.flattenOffset();
    this.hideDragArea();

    if (this.state.isInArea) {
      this.state.translateValue.setValue({ x: 10000, y: 10000 });
      this.dragArea.hide(this.props.close);
      return;
    }

    const y = this.state.translateValue.y.__getValue();
    // deal with y position
    if (y < 10 || y > height - FloatBallWH - 10) {
      Animated.spring(this.state.translateValue.y, {
        toValue: y < 10 ? 10 : height - FloatBallWH - 10,
        duration: 200
      }).start();
    }
    // deal with x position
    Animated.spring(this.state.translateValue.x, {
      toValue: gestureState.moveX > width * 0.5 ? rightPosition : leftPosition,
      duration: 200
    }).start();

    // get last time translateValue
    this.lastValueX = this.state.translateValue.x.__getValue();
    this.lastValueY = this.state.translateValue.y.__getValue();

    releaseTime = Date.parse(new Date());
    // single tap
    if (
      releaseTime - this.time < 50 &&
      Math.abs(gestureState.dx) < 10 &&
      Math.abs(gestureState.dy) < 10
    ) {
      !this.state.isOpen && this.open();
    }
  };

  isInArea = (top, left) => {
    if (this.area) {
      isIn = top > this.area.top && left > this.area.left;
      if (isIn === this.state.isInArea) return;
      if (isIn) {
        this.setState({ isInArea: true }, () => this.dragInOrOutArea(true));
      } else {
        this.setState({ isInArea: false }, () => this.dragInOrOutArea(false));
      }
    }
  };

  /** ************ Render Component */
  renderFloatBtn() {
    const { isOpen, toFloat, animating } = this.state
    if (!isOpen && toFloat && !animating) {
      return (
        <View
          {...this.gestureResponder.panHandlers}
          style={[styles.FloatPosition, styles.FloatBtn]}
        >
            <Image
              source={this.state.FloatImage ? { uri: this.state.FloatImage.image.url } : MirrorImg}
              style={styles.FloatImage}
            />
          <View
          style={styles.PlayPause}
          >
          {
            this.state.pause
            ? <Icon name="play" size={20} color={"#fff"} />
            : <Icon name="pause" size={20} color={"#fff"} />
          }
          </View>
        </View>
      );
    }
    return null;
  }

  render() {
    const { translateValue } = this.state;

    animStyle = {
      width: this.state.animateValue.interpolate({
        inputRange: [0, 1],
        outputRange: [FloatBallWH, width]
      }),
      height: this.state.animateValue.interpolate({
        inputRange: [0, 1],
        outputRange: [FloatBallWH, height]
      }),
      borderRadius: this.state.animateValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [FloatBallWH * 0.1, 20, 0]
      })
    };

    transformStyle = { transform: translateValue.getTranslateTransform() };

    return (
      <Animated.View style={[styles.container, animStyle, transformStyle]}>
        {/* <NavigationBar title="" leftBtnClick={this.back} /> */}
        <View
          style={styles.PlayerBackground}
        >
        <Icon.Button name="sort-down" size={30} backgroundColor={"rgba(0, 0, 0, 0)"} onPress={this.back} />
          {this.props.children}
        </View>
        {this.renderFloatBtn()}
      </Animated.View>
    );
  }
}

class NavigationBar extends PureComponent {
  leftBtnClick = () => {
    this.props.leftBtnClick && this.props.leftBtnClick();
  };

  render() {
    return (
      <View style={NavStyles.Bar}>
        {/** Left Button**/}
        <TouchableOpacity onPress={this.leftBtnClick}>
          <Image
            style={NavStyles.Left}
            source={require("../../assets/images/close.png")}
          />
        </TouchableOpacity>
        {/** Title**/}
        <Text style={NavStyles.Title}>{this.props.title}</Text>
        {/** Right Button**/}
        <TouchableOpacity style={NavStyles.Right}>
          {this.props.rightComponent}
        </TouchableOpacity>
        <View style={NavStyles.Separate} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
    zIndex: 2
  },
  FloatBtn: {
    height: FloatBallWH,
    width: FloatBallWH,
    height: FloatBallWH,
    backgroundColor: "rgba(39, 57, 71, 0.9)",
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
    width: 45,
    height: 45,
    borderRadius: 4,
  },
  PlayPause: {
    shadowColor: 'black',
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  PlayerBackground: {
    marginTop: height * 0.05,
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 15,
    flex: 1,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: "rgba(39, 57, 71, 0.9)"
  }
});

const NavStyles = StyleSheet.create({
  Bar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: 64,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingTop: 20
  },
  Left: {
    marginLeft: 20,
    width: 20,
    height: 20
  },
  Title: {
    fontSize: 17
  },
  Right: {
    marginRight: 20,
    width: 20,
    height: 20
  },
  Separate: {
    height: 0.5,
    backgroundColor: "lightgray",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0
  }
});

// const mapStateToProps = state => ({
//   pause: state.currentPlay.pause
// })

// export default connect(mapStateToProps)(Window);
