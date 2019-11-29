import { combineReducers } from 'redux';
import { TYPE } from './actions';

const currentPlay = (state = {}, action) => {
    // console.log(action)
    switch (action.type) {
        case TYPE.SET_PLAY_ID:
            return {...state, id: action.id};
        case TYPE.SET_PLAY_SONG:
            return {...state, ...action.song};
        case TYPE.SET_MUSIC_PAUSE:
            return {...state, ...action.pause};
        default:
            return {...state};
    }
}

const currentPlayList = (state = {}, action) => {
    switch (action.type) {
        case TYPE.SET_PLAY_LIST:
            return {...state, ...action.list};
        default:
            return {...state};
    }
}

const currentPlayVideo = (state = {}, action) => {
    switch (action.type) {
        case TYPE.SET_PLAY_VIDEO:
            return {...state, ...action.video};
        default:
            return {...state};
    }
}

export default combineReducers({
    currentPlay,
    currentPlayList,
    currentPlayVideo,
})
