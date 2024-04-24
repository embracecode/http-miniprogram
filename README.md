### 使用介绍

微信小程序请求封装，及其类型验证，以及储存方式的同步异步封装，包含以下功能：

1. 请求拦截器
2. 响应拦截器
3. 并发请求
4. 本地资源上传等
5. js 类型验证
6. 微信储存方式的封装

<br />

### 安装

<br />

> 在微信项目中 先 npm init -y

```shell
    npm install http-miniprogram
```

> 构建 npm：
>
> ​ 安装包后，需要在微信开发者工具中左上角进行 npm 构建，点击`工具`选项， 倒数第四个选项 `构建 npm`（可能不是倒数第四个看自己的位置）

<br />

#### 创建实例

<br />

```js
import WxRequest from "http-miniprogram";

// 对 WxRequest 进行实例化
const instance = new WxRequest({
  baseURL: "https://some-domain.com/api", // 使用时请换成真实接口
  timeout: 1000, // 超时时长
  isNeedLoading: false, // 是否使用默认的 loading 效果
});
```

<br />

#### 实例方法

<br />

以下是可用的实例方法。指定的配置将与实例的配置合并。

> config 对象属性值和 wx.request() 方法调用时传递的参数保持一致

<br />

```js
instance.request(config);
instance.get(url, data, config);
instance.delete(url, data, config);
instance.post(url, data, config);
instance.put(url, data, config);
instance.all(promise); // 与promise.all用法一致
instance.upload(url, filePath, name, config); // 将本地资源上传到服务器
```

<br />

#### 代码示例

<br />

```js
// request 实例方法
instance.request({
  url: "/path",
  method: "POST",
});

// get 实例方法

// 不需要请求参数，也不需要自定义请求配置
instance.get("/path");

// 不需要自定义请求配置
instance.get("/path", { id: 123 });

// 需要请求参数，也需要自定义请求配置
instance.get("/path", { id: 123 }, { timeout: 15000 });

// 不需要请求参数，但需要自定义请求配置
instance.get("/path", null, { timeout: 15000 });

// delete、post、put 方法同上
```

<br />

### 请求配置

<br />

这些是创建请求时可以用的配置选项。如果没有指定 `method`，请求将默认使用 `GET` 方法。

<br />

```js
{
  baseURL: '', // 请求基准路径，方便进行接口的统一管理
  url: '', // 是用于请求的服务器 URL
  method: 'GET', // method是创建请求时使用的方法，默认值是 GET
  headers: {}, // 请求头
  data: {}, // 请求参数
  timeout: 60000, // 默认的超时时长，小程序默认的超时时长是 1 分钟
  isLoading: true // 控制是否使用默认的 loading，默认值是 true 表示使用默认的 loading

  // ... 其他属性值和 wx.request() 方法调用时传递的参数保持一致
}

```

<br />

### 默认配置

<br />

您可以指定默认配置，它将作用于每个请求。

<br />

#### 全局默认值

<br />

```js
instance.defaultConfig.baseURL = "https://some-domain.com/api/";
instance.defaultConfig.header["token"] = token;
instance.defaultConfig.isLoading = fasle;
```

<br />

#### 自定义实例默认值

<br />

```js
// 创建实例时配置默认值
const instance = new WxRequest({
  baseURL: "https://some-domain.com/api/",
});

// 创建实例后修改默认值
instance.defaultConfig.header["token"] = token;
```

<br />

#### 配置的优先级

<br />

实例方法配置(2) > 创建实例时配置项(1) > 默认配置(0)

<br />

```js
// 默认配置，优先级 最低
{
  timeout: 60000 // 默认的超时时长，小程序默认的超时时长是 1 分钟
}

// 创建实例时配置项，中间
const instance = new WxRequest({
  timeout = 2500
})

// 调用实例方法，优先级 最高
instance.get('/path', null, {
  timeout: 5000
})

```

<br />

### 拦截器

<br />

在请求之前新增、修改参数，在响应以后进行逻辑判断、处理

<br />

```js
// 添加请求拦截器
instance.interceptors.request.use = (config) => {
  // 在发送请求之前做些什么
  return config;
};

// 添加响应拦截器
instance.interceptors.response.use = (response) => {
  // response.isSuccess = true，代码执行了 wx.request 的 success 回调函数
  // response.isSuccess = false，代码执行了 wx.request 的 fail 回调函数

  // response 包含网络请求参数response.config 以及 服务器的真正响应数据 response.data  和状态码根据状态码判断接口请求的状态
  // 因为wx.request 在请求错误（非网络错误）的时候，如（地址错误， 参数错误）也是会走请求成功的回调 所以需要 isSuccess 参数识别

  // 对响应数据做点什么
  return response;
};
```

<br />

### 本地资源上传

<br />

将本地资源上传到服务器.

<br />

```js
/**
 * @description upload 实例方法，用来对 wx.uploadFile 进行封装
 * @param {*} url 文件的上传地址、接口地址
 * @param {*} filePath 要上传的文件资源路径
 * @param {*} name 文件对应的 key
 * @param {*} config 其他配置项
 */

// 内部实现
upload(url, filePath, name = 'file', config = {}) {
  return this.request(
    Object.assign({ url, filePath, name, method: 'UPLOAD' }, config)
  )
}

// 使用示例
await instance.upload('/path', filePath, name, { ... })


// 可以单独抽离出来  http是通过new WxRequest 实例化出来的对象


<button open-type="chooseAvatar" bindchooseavatar="getAvatar" class="btn">
   <image class="avtar" src="{{ avatarUrl }}"></image>
</button>

async getAvatar(event) {
    const { avatarUrl } = event.detail
    const result = await uploadfile(avatarUrl, 'customfilename')
    ...
}

// filepath 值要上传的文件资源的路径  name 指的是文件对应的key


const uploadfile = (filePath, name) => {
    return http.upload('/接口地址', filePath, name)
}

```

<br />

### 并发请求

<br />

```js
/**
 * @description 处理并发请求
 * @param  {promise} promise 传入的每一项需要是 Promise
 * @returns Promise
 */
// 内部实现
all(promise) {
  // 那么展开运算符会将传入的参数转成数组
  return Promise.all(promise)
}

// 使用示例
await instance.all([promise1, promise2, promise3])

```

<br />

### 对小程序储存方法的封装

```js
import {
  getSrorageSync,
  getSrorage,
  setStorageSync,
  setStorage,
  removeStorageSync,
  removeStorage,
  clearStorageSync,
  clearStorage,
} from "http-miniprogram";
getSrorageSync("name", 123);
getSrorage("name", 123).then(
  (res) => {
    console.log(res);
  },
  (ref) => {
    console.log(rej);
  }
);
// 其他同上
```

### 对 js 类型检测的封装

```js
import { getType } from "http-miniprogram";

getType.isObject({}); // true
getType.isArray([]); // true
getType.isNumber(123); // true
getType.isNumber(NaN); // false
```

<br />

### 完整示例

<br />

导入 `http-miniprogram` ，进行网络请求统一配置：

> 以下代码可以直接复制粘贴至 utils 文件夹下面的 instance.js 中 直接使用

```js
import WxRequest from "http-miniprogram";

// 对 WxRequest 进行实例化
const instance = new WxRequest({
  baseURL: "xxxxx",
  timeout: 15000,
  isNeedLoading: false, // 不使用默认 loading
});

// 添加请求拦截器
instance.interceptors.request.use = (config) => {
  // 在请求发送之前做点什么……

  // 新增请求头
  const token = wx.getStorageSync("token");

  if (token) {
    config.header["token"] = token;
  }

  return config;
};

// 添加响应拦截器
instance.interceptors.response.use = (response) => {
  // 对响应数据做点什么

  // 从 response 中解构 isSuccess
  const { isSuccess, data } = response;

  // 如果 isSuccess 为 false，说明执行了 fail 回调函数
  // 这时候就说明网络异常，需要给用户提示网络异常
  if (!isSuccess) {
    wx.showToast({
      title: "网络异常，请稍后重试 !",
    });

    return response;
  }

  // 对业务状态码进行判断 根据大家的实际需要看接口返回的是什么字段 有的公司返回的是code 有的是status等
  // ...

  // 将服务器响应的数据返回
  return data;
};

export default instance;
```

导入实例，使用实例提供的方法：

```js
// 导入封装的 网络请求模块实例
import instance from "../utils/instance";

/**
 * @description 用来获取首页轮播图数据
 */
// xxxx代表去除基础路径之后的接口路径
export const reqSwiperData = () => instance.get("xxxx");
```
