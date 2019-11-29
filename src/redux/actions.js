export const TYPE = {
    SET_PLAY_ID: 'SET_PLAY_ID',
    SET_PLAY_SONG: 'SET_PLAY_SONG',
    SET_PLAY_LIST: 'SET_PLAY_LIST',
    SET_PLAY_VIDEO: 'SET_PLAY_VIDEO',
    SET_MUSIC_PAUSE: 'SET_MUSIC_PAUSE',
    THEME_COLOR: 'THEME_COLOR',
}

export const setPlayId = id => ({
    type: TYPE.SET_PLAY_ID,
    id
})

export const setPlaySong = song => ({
    type: TYPE.SET_PLAY_SONG,
    song
})

export const setPlayList = list => ({
    type: TYPE.SET_PLAY_LIST,
    list
})

export const setMusicPause = pause => ({
    type: TYPE.SET_MUSIC_PAUSE,
    pause
  })

export const setPlayVideo = video => ({
    type: TYPE.SET_PLAY_VIDEO,
    video
})

export const setThemeColor = (payload) => ({
    type: TYPE.THEME_COLOR,
    payload
  })