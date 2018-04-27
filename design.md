小程序在App中提供onError函数，我们通过onError收集错误即可，但是如果只是简单的收集，不便于排查错误，所以我们通过方法注入的形式，监听应用执行函数的顺序。

#### 1、简单监控

在App的onError中监听并上传错误
```
App({
  // 监听错误
  onError: function (err) {
    console.log(err)
    // 上报错误
    wx.request({
      url: "https://url", // 自行定义报告服务器
      method: "POST",
      data: params
    })
  },
  // 触发错误
  onLaunch: function () {
    throw new Error('my error msg')
  }
})
```


#### 2、错误路径收集
为了实现错误追踪，只收集错误栈是不够的，我们还希望收集错误产生的路径，从进入页面开始，执行了哪些方法，导致了错误

```
// app.js代码
var xbossdebug = require('libs/xbossdebug.js') // 把监控功能封装起来
App({
  baseUrl: 'https://m.maizuo.com/v4/api',
  onError: function (err) {
    xbossdebug.record('onErro function excute')
  },
  onLaunch: function () {
    xbossdebug.record('onLaunch function excute')
  },
  onShow: function () {
    xbossdebug.record('onShow function excute')
  }
})

// libs/xbossdebug.js代码
var fnExcutePath = []
function record (msg) {
  fnExcutePath.push(msg)
}
module.exports = {
  record
}
```
**抽取模版代码**
简单收集，产生了大量模版代码，我们希望可以把模版代码移到统一到地方管理
```
// libs/xbossdebug.js代码
// 保存App的上下文 
var originApp = App
// 为了插入自定义代码到App生命周期，重新定义App对象
App = function(app) {
  // 记录app.js里定义的执行内容
  var originOnLaunch = app['onLaunch']
  // 重新定义onLaunch方法
  app['onLaunch'] = function () {
    // 自定义代码
    record('onLaunch excute')
    // 调用原定义代码
    originOnLaunch()
  }
  // 记录app.js里定义的执行内容
  var originOnShow = app['onShow']
  // 重新定义onLaunch方法
  app['onShow'] = function () {
    // 自定义代码
    record('onShow excute')
    // 调用原定义代码
    originOnShow()
  }

  // 执行原App对象
  originApp(app)
}

var fnExcutePath = []
function record (msg) {
  fnExcutePath.push(msg)
  console.log(fnExcutePath)
}
module.exports = {
  record
}
```

**优化重复代码**
```
// 合并执行函数
function mergeMethod(app, key, method) {
  var oldMethod = app[key]; // 暂存原方法定义
  // 合并方法
  app[key] = function (app) {
    return method.call(this, app), oldMethod && oldMethod.call(this, app)
  }
}
// 保存App的上下文 
var originApp = App
// 为了插入自定义代码到App生命周期，重新定义App对象
App = function(app) {
  mergeMethod(app, 'onLaunch', function () {
    record('onLaunch Excute')
  })
  // 执行原App对象
  originApp(app)
}

// Page执行路径记录，方法和App的记录一样
var originPage = Page
Page = function (page) {
  mergeMethod(page, 'onShow', function () {
    record('page onShow Excute')
  })
  // 执行原Page对象
  originPage(page)
}

var fnExcutePath = []
function record (msg) {
  fnExcutePath.push(msg)
  console.log(fnExcutePath)
}
module.exports = {
  record
}
```