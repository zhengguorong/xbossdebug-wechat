// 获取网络状态 wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
function getNetworkType() {
  wx.getNetworkType({
    success: function (res) {
      reqParams.networkType = res.networkType
    }
  })
}

// 获取设备信息
function getSystemInfo() {
  wx.getSystemInfo({
    success: function (res) {
      reqParams.systemInfo = res
    }
  })
}

// 获取当前的地理位置、速度。
function getLocation() {
  wx.getLocation({
    type: "wgs84",
    success: function (res) {
      reqParams.locationInfo = res
    }
  })
}

// 获取用户信息
function getUserInfo() {
  wx.getUserInfo({
    success: function (res) {
      reqParams.userInfo = res.userInfo
    }
  })
}

// 获取当前显示的页面
function getActivePage() {
  var curPages = getCurrentPages();
  if (curPages.length) return curPages[curPages.length - 1]
}

// 记录函数执行情况，最多记录20个
function pushToBreadcrumb(obj) {
  breadcrumbs.push(obj), breadcrumbs.length > 20 && breadcrumbs.shift()
}

// 记录App对象里的方法执行
function recordAppFn(app, key, method) {
  var oldMethod = app[key]; // 暂存原方法定义
  // 合并方法
  app[key] = function (app) {
    method.call(this, app)
    oldMethod && oldMethod.call(this, app)
  }
}

// 记录Page对象里的方法执行
function recordPageFn(page, methodName) {
  var method = page[methodName]
  page[methodName] = function () {
    if ("onLoad" === methodName || "onShow" === methodName) (activePage = getActivePage())
    var breadcrumb = {
      type: "function",
      time: now(),
      belong: "Page",
      method: methodName,
      route: activePage && activePage.route,
      options: activePage && activePage.options
    }
    "onLoad" === methodName && (breadcrumb.args = arguments)
    methodFilter(methodName) && pushToBreadcrumb(breadcrumb)
    method && method.apply(this, arguments)
  }
}

// 黑白名单过滤,白名单优先级高于黑名单，当黑白名单都配置时，只有白名单生效
function methodFilter(methodName) {
  var methodWhitelist = xbossDebug.methodWhitelist
  var methodBlacklist = xbossDebug.methodBlacklist
  // 防止监听onPageScroll事件
  var isCanExcute = "onPageScroll" !== methodName && methodWhitelist && methodWhitelist.length ? Boolean(methodWhitelist.includes(methodName)) : !methodBlacklist || !methodBlacklist.length || Boolean(!methodBlacklist.includes(methodName))
  return isCanExcute
}

// 获取当前时间戳
function now() {
  return (new Date).getTime()
}

// 应用初始化记录信息
function onLaunch(route) {
  getNetworkType() // 获取网络连接信息
  xbossDebug.setSystemInfo && getSystemInfo()
  xbossDebug.setLocation && getLocation()
  xbossDebug.setUserInfo && getUserInfo()
  var breadcrumb = {
    type: "function",
    time: now(),
    belong: "App", // 来源
    method: "onLaunch",
    path: route.path, // 页面路径
    query: route.query, // 页面参数
    scene: route.scene // 场景编号
  };
  pushToBreadcrumb(breadcrumb) // 把执行对象加入到面包屑中
}

// 应用显示记录信息
function onShow(route) {
  reqParams.scene = route.scene;
  var breadcrumb = {
    type: "function",
    time: now(),
    belong: "App",
    method: "onShow",
    path: route.path,
    query: route.query,
    scene: route.scene
  };
  pushToBreadcrumb(breadcrumb)
}

// 应用隐藏记录信息
function onHide() {
  var breadcrumb = {
    type: "function",
    time: now(),
    belong: "App",
    method: "onHide",
    route: pages.route,
    options: pages.options
  };
  pushToBreadcrumb(breadcrumb)
}

var version = '0.0.1', // 插件版本
  reqParams = {
    notifierVersion: version
  },
  breadcrumbs = [], // 用于记录出错前函数执行路径
  activePage, // 当前打开页面实例，用于获取相关参数
  // 外部可访问对象
  xbossDebug = {
    // 发送错误信息到服务器
    notifyError: function (err) {
      if (xbossDebug.apikey && err && !xbossDebug.silent) {
        reqParams.apikey = xbossDebug.apikey
        reqParams.appVersion = xbossDebug.appVersion
        reqParams.releaseStage = xbossDebug.releaseStage || "production"
        reqParams.breadcrumbs = breadcrumbs
        reqParams.error = err
        reqParams.time = now();
        wx.request({
          url: xbossDebug.url,
          method: "POST",
          data: reqParams
        })
      }
    }
  }


// App对象生命周期函数
var appHookMethods = {
  onLaunch: onLaunch,
  onShow: onShow,
  onHide: onHide,
  onError: xbossDebug.notifyError
}

// 保存App的上下文 
var originApp = App
// 为了插入自定义代码到App生命周期，重新定义App对象
App = function (app) {
  Object.keys(appHookMethods).forEach(function (key) {
    recordAppFn(app, key, appHookMethods[key])
  })
  // 执行原App对象
  originApp(app)
}

// Page执行路径记录，方法和App的记录一样
var originPage = Page,
  pageHookMethods = ["onLoad", "onShow", "onReady", "onHide", "onUnload", "onPullDownRefresh", "onReachBottom", "onShareAppMessage"]
Page = function (page) {
  // 记录page生命周期函数
  pageHookMethods.forEach(function (hookName) {
    page[hookName] && recordPageFn(page, hookName)
  })
  // 记录用户自定义函数
  xbossDebug.monitorMethodCall && Object.keys(page).forEach(function (fn) {
    "function" != typeof page[fn] || pageHookMethods.includes(fn) || recordPageFn(page, fn)
  })
  // 执行原Page对象
  originPage(page)
}


module.exports = xbossDebug