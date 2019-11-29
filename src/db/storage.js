import Storage from 'react-native-storage'
import { AsyncStorage } from '@react-native-community/async-storage'

global.storage = new Storage({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: null, // 不過期
  enableCache: true,
})

module.exports = global.storage
