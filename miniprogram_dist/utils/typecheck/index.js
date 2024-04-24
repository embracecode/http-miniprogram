

let toString = Object.prototype.toString


export function getType(value) {
    let type = toString.call(value).slice(8, -1)
    if (type === 'Number' && isNaN(value)) {
        return NaN
    } else {
        return type
    }
}
const types = [
    'Object',
    'Array',
    'Number',
    'String',
    'Undefined',
    'Null',
    'Boolean',
    'Date',
    'RegExp',
    'Function',
    'Symbol'
]

types.forEach(item => {
    getType['is' + item] = function (value) {
        let result = getType(value)
        if (item === result) {
            return true
        } else { 
            return false
        }
    }
})



export function mergeConfig(key, value, isNeedValue = true) {
    let defaultConfig = {
        key: '',
        data: ''
    }
    if (!getType.isObject(key)) {
        defaultConfig.key = key
        defaultConfig.data = value
        if (!isNeedValue) {
            delete defaultConfig.data
        }
        return defaultConfig
    }
    return Object.assign(defaultConfig, key)
}