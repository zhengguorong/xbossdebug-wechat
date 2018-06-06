## 前言

你是否经常碰到业务反馈，线上的小程序某个页面打不开了，订单没法结算了，但是你当时测试的时候都是好好的。

由于线上环境复杂，一些问题只会在特定网络环境或者设备上发生，对于这类问题，异常信息的收集就显得格外重要了，我们不但希望收集**错误的堆栈信息，还需要用户操作流程，设备信息**等，以便复现错误。



## 简单收集

小程序App()生命周期里提供了onError函数，可以通过在onError里收集异常信息

```
App({
  // 监听错误
  onError: function (err) {
    // 上报错误
    wx.request({
      url: "https://url", // 自行定义报告服务器
      method: "POST",
      errMsg: err
    })
  }
})
```



## 用户操作路径收集

一些较隐蔽的错误如果只有错误栈信息，排查起来会比较难，如果有用户操作的路径，在排查时就方便多了。

**方法一：暴力打点方法收集**

优点：简单直接

缺点：污染业务代码，造成较多垃圾代码

**方法二：函数劫持（推荐使用）**

需要在App函数中的onLaunch、onShow、onHide生命周期插入监控代码，我们通过重写App生命周期函数来实现。

```
App = function(app) {
    ["onLaunch", "onShow", "onHide"].forEach(methodName => {
        app[methodName] = function(options) {
          // 构造访问日志对象
          var breadcrumb = {
            type: "function",
            time: utils.now(),
            belong: "App", // 来源
            method: methodName,
            path: options && options.path, // 页面路径
            query: options && options.query, // 页面参数
            scene: options && options.scene // 场景编号
          };
          self.pushToBreadcrumb(breadcrumb); // 把执行对象加入到面包屑中
    })
}
```

但是这样写，会把用户自定义的内容给覆盖掉，所以我们还需要把用户定义的函数和监控代码合并。

````
 var originApp = App // 保存原对象
 App = function(app) {
 	// .... 此处省略监控代码
 	// .... 此处省略监控代码
 	originApp(app) // 执行用户定义的方法
 }
````

**记录结果**

可以从下面的json看出，用户到了detail页面，执行了onLoad => getDetail => onReady => buy 当执行buy方法的时候报错。

```json
{"method":"onLoad","route":"pages/film/detail","options":{"id":"4206"}},
{"method":"getDetail","route":"pages/film/detail","options":{"id":"4206"}},	{"method":"onReady","route":"pages/film/detail","options":{"id":"4206"}},{"method":"buy","route":"pages/film/detail","options":{"id":"4206"}}]
```



## 上报策略

考虑到在大型应用中，日志量比较大，我们采取**抽样，合并，过滤**三个方法减少日志的输出，代码实现可以参考lib/report.js



## 代码组织

项目使用rollup作为构建工作，实现ES6转ES5，模块加载功能。

项目目录如下：

```
src/
	lib/
		config.js  // 配置文件
		core.js	 // 劫持小程序核心代码
		events.js  // 监听自定义事件
		report.js // 上报类
		utils.js // 工具类
	index.js // 主入口
```




## 参考资料

[fundebug](https://www.fundebug.com/) 

[前端异常监控系统落地](https://zhuanlan.zhihu.com/p/26085642)