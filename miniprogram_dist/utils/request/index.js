export class WxRequest {
  defaultConfig = {
      baseUrl: '', // 请求的接口路径的基础地址
      url: '', // 需要请求的接口路径
      data: null, // 请求参数
      methods: 'GET', // 请求方法
      // 请求头
      header: {
          'Content-Type': 'application/json', // 设置默认请求头
      },
      timeout: 30000, // 设置超时时长 默认为30s
      isNeedLoading: true, //控制是否需要使用默认的loading 默认为true 需要使用默认的loading 
  }
  interceptors = {
      // 请求拦截器
      request: {
          use: config => config
      },
      // 响应拦截器
      response: {
          use: res => res
      }
  }
  /**
   * 记录定时器id 
   * 用于在链式调用的时候 清楚上一次的loading效果 防止loading 闪烁
   */
  timerId = null 

  queue = [] // 定义数组队列  用来储存请求队列，储存请求标识 用来控制loading的展示

  constructor(option = {}) {
      // 需要传入的配置参数，覆盖默认的参数
      this.defaultConfig = Object.assign({}, this.defaultConfig, option)
  }
  /**
 * @description request 实例方法发送网络请求，接收一个对象类型的参数
 * @param {*} options 属性值和 wx.request() 方法调用时传递的参数保持一致
 * @returns Promise
 */
  request(options) {
      // 清楚上一次请求的产生的定时器  用来防止当loading效果开启的时候 链式调用接口时 会出现loading闪烁问题 
      this.timerId && clearTimeout(this.timerId)
      this.timerId = null
      // 拼接接口地址
      options.url = this.defaultConfig.baseUrl + options.url

      options = {
          ...this.defaultConfig,
          ...options
      }

      // 开启loading 效果 上传文件接口默认有loading 效果
      if (options.isNeedLoading && options.methods !== 'UPLOAD') {
          this.queue.length === 0 && wx.showLoading()
          this.queue.push('request')
      }
      // 在请求发送之前，调用请求拦截器，新增和修改请求参数
      // 请求拦截器内部，会将新增和修改以后的参数返回
      options = this.interceptors.request.use(options)
      return new Promise((resolve, reject) => {
          // 如果 method 等于 UPLOAD 说明需要调用 wx.uploadFile() 方法
          // 否则调用的是 wx.request() 方法
          if (options.methods === 'UPLOAD') {
              wx.uploadFile({
                  ...options,
                  success: (res) => {
                      // 需要将服务器返回的 JSON 字符串 通过 JSON.parse 转成对象
                      res.data = JSON.parse(res.data)

                      // 合并参数
                      const mergeRes = Object.assign({}, res, {
                          config: options,
                          isSuccess: true
                      })

                      resolve(this.interceptors.response.use(mergeRes))
                  },

                  fail: (err) => {
                      // 合并参数
                      const mergeErr = Object.assign({}, err, {
                          config: options,
                          isSuccess: false
                      })

                      reject(this.interceptors.response.use(mergeErr))
                  }
              })
          } else {
              wx.request({
                  ...options,
                  success: (res) => {
                      // 合并请求参数，方便进行代码调试
                      // 追加 isSuccess 属性，是为了标识响应拦截器是 success 调用还是 fail 调用
                      const mergeRes = Object.assign({}, res, {
                          config: options,
                          isSuccess: true
                      })
                      resolve(this.interceptors.response.use(mergeRes))
                  },
                  fail: (err) => {
                      // 合并请求参数，方便进行代码调试
                      // 追加 isSuccess 属性，是为了标识响应拦截器是 success 调用还是 fail 调用
                      const mergeErr = Object.assign({}, err, {
                          config: options,
                          isSuccess: false
                      })
                      reject(this.interceptors.response.use(mergeErr))
                  },

                  // 接口调用结束的回调函数（调用成功、失败都会执行）
                  complete: () => {
                      // 如果需要显示 loading ，那么就需要控制 loading 的隐藏
                      if (options.isNeedLoading) {
                          // 在每一个请求结束以后，都会执行 complete 回调函数
                          // 每次从 queue 队列中删除一个标识
                          this.queue.pop()

                          // 解决并发请求，loading 闪烁问题
                          this.queue.length === 0 && this.queue.push('request')

                          // 解决链式调用时，loading 闪烁问题
                          this.timerId = setTimeout(() => {
                              this.queue.pop()

                              this.queue.length === 0 && wx.hideLoading()

                              clearTimeout(this.timerId)
                          }, 1)
                      }
                  }
              })
          }
      })
  }
  // 可以井号开头设置私有属性或方法的 #runRequest 语法太新 肯呢个会不支持  暂时用约定俗成的规则
  _runRequest(url, data = {}, config = {}, methdos) {
      return this.request(Object.assign({ url, data, method: methdos }, config))
  }
  /**
   * @description GET 实例方法
   * @param {*} url 请求地址
   * @param {*} data 请求参数
   * @param {*} config 其他请求配置项
   * @returns Promise
   */
  get(url, data = {}, config = {}) {
      // 需要调用 request 请求方法发送请求，只需要组织好参数，传递给 request 请求方法即可
      // 当调用 get 方法时，需要将 request 方法的返回值 return 出去
      // return this.request(Object.assign({ url, data, method: 'GET' }, config))
      return this._runRequest(url, data, config, 'GET')
  }
  /**
   * @description DELETE 实例方法
   * @param {*} url 请求地址
   * @param {*} data 请求参数
   * @param {*} config 其他请求配置项
   * @returns Promise
   */
  delete(url, data = {}, config = {}) {
      // return this.request(Object.assign({ url, data, method: 'DELETE' }, config))
      return this._runRequest(url, data, config, 'DELETE')
  }

  /**
   * @description POST 实例方法
   * @param {*} url 请求地址
   * @param {*} data 请求参数
   * @param {*} config 其他请求配置项
   * @returns Promise
   */
  post(url, data = {}, config = {}) {
      // return this.request(Object.assign({ url, data, method: 'POST' }, config))
      return this._runRequest(url, data, config, 'POST')

  }

  /**
   * @description PUT 实例方法
   * @param {*} url 请求地址
   * @param {*} data 请求参数
   * @param {*} config 其他请求配置项
   * @returns Promise
   */
  put(url, data = {}, config = {}) {
      // return this.request(Object.assign({ url, data, method: 'PUT' }, config))
      return this._runRequest(url, data, config, 'PUT')
  }

  /**
   * @description 处理并发请求
   * @param  {...promise} promise 传入的每一项需要是 Promise
   * @returns Promise
   */
  all(promise) {
      // 那么展开运算符会将传入的参数转成数组
      return Promise.all(promise)
  }
  /**
 * @description upload 实例方法，用来对 wx.uploadFile 进行封装
 * @param {*} url 文件的上传地址、接口地址
 * @param {*} filePath 要上传的文件资源路径
 * @param {*} name 文件对应的 key
 * @param {*} config 其他配置项
 */
  upload(url, filePath, name = 'file', config = {}) {
      return this.request(
          Object.assign({ url, filePath, name, method: 'UPLOAD' }, config)
      )
  }
  
}