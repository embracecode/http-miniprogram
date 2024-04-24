
import { mergeConfig } from '../typecheck/index'

/**
 * @description 存储数据
 * @param {*} key 本地存储所需要的key
 * @param {*} value key值对应的value
 */
export const setStorageSync = (key, value) => {
    try {
        wx.setStorageSync(key, value)
    } catch (error) {
        console.log(`存取指定${key}数据发生了异常`, error);
    }
}
/**
 * @description 微信储存的异步方法
 * @param { string | Object} key  一个字符串或者一个符合wx.setStorage的一个配置对象
 * @param {*} value 当key 为字符串的时候 对应的value值
 * @returns 
 */
export const setStorage = (key, value) => {
    let defaultConfig = mergeConfig(key, value)
    return new Promise((resolve, reject) => {
        wx.setStorage({
            ...defaultConfig,
            complete: (res) => {
                resolve(res)
            }
        })
    })
}

/**
 * @description 获取数据
 * @param {*} key 获取数据所需要的key
 * @param {*} value key值对应的value
 */
export const getStorageSync = (key, value) => {
    try {
        const result = wx.getStorageSync(key, value)
        if (result) {
            return result
        }
    } catch (error) {
        console.log(`获取指定${key}数据发生了异常`, error);
    }
}
/**
 * @description 获取微信储存的异步方法
 * @param { string | Object} key  一个字符串或者一个符合wx.getStorage的一个配置对象
 * @returns 
 */
export const getStorage = (key) => {
    let defaultConfig = mergeConfig(key, '', false)
    return new Promise((resolve, reject) => {
        wx.getStorage({
            ...defaultConfig,
            complete: (res) => {
                resolve(res)
            }
        })
    })
}

/**
 * @description 移除指定数据
 * @param {*} key 移除数据的key值
 */
export const removeStorageSync = (key) => {
    try {
        wx.removeStorageSync(key)
    } catch (error) {
        console.log(`移除指定${key}数据发生了异常`, error);
    }
}
/**
 * @description 移除微信储存的异步方法
 * @param { * } key  一个需要移除storage的key 值
 * @returns 
 */
export const removeStorage = (key) => {
    return new Promise((resolve, reject) => {
        wx.removeStorage({
            key,
            complete: (res) => {
                resolve(res)
            }
        })
    })
}

/**
 * @description 移除本地储存数据
 */
export const clearStorageSync = () => {
    try {
        wx.clearStorageSync()
    } catch (error) {
        console.log(`移除全部储存数据发生了异常`, error);
    }
}

/**
 * @description 移除本地储存数据异步方法
 */
export const clearStorage = () => {
    return new Promise((resolve, reject) => {
        wx.clearStorage({
            complete: (res) => {
                resolve(res)
            }
        })
    })
}


