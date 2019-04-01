[![Build Status](https://travis-ci.org/zhengguorong/xbossdebug-wechat.svg?branch=master)](https://travis-ci.org/zhengguorong/xbossdebug-wechat)
[![codecov](https://codecov.io/gh/zhengguorong/xbossdebug-wechat/branch/master/graph/badge.svg)](https://codecov.io/gh/zhengguorong/xbossdebug-wechat)

# xbossdebug  小程序异常监控工具

### 应用场景

1、监听线上未知错误

```
// 例如：调用错误
var result = {}
console.log(result.data.msg) // 抛出错误
```

2、记录用户操作路径，更方便重现错误

![](https://github.com/zhengguorong/xbossdebug-wechat/blob/master/README.png)



### 小程序使用

##### 1、引入资源

在app.js中加入dist目录下的xbossdebug.min.js，记得放在App对象上面

```
var xbossdebug = require('xbossdebug.min.js') // 引用xbossdebug
xbossdebug.config.key = 'maizuo' // key为自定义唯一值，用于后端记录时区分应用
xbossdebug.config.url = 'https://domain.com/'; // 上报服务端地址
// 可选参数
xbossdebug.config.setSystemInfo = true; // 获取系统信息
xbossdebug.config.setLocation = true; // 获取用户位置信息
```

##### 2、测试是否正常使用

```
App({
  onLaunch: function () {
    xbossdebug.error('error')
  }
})
```

##### 3、控制台查看network，如果看到一个指向你配置url的请求，那就成功了。

```
// 发送的结构如下
{
    key: String // 应用唯一id
    breadcrumbs: Array // 函数执行面包线，方便用于错误重现
    error: String // 错误堆栈信息
    systemInfo: Object // 用户系统信息
    notifierVersion: String // 插件版本
    locationInfo: Object // 用户位置信息
}
```



### 高级配置

如果你的应用日志量较大，可以通过以下参数合并日志和随机抽样。

```
xbossdebug.config.random = 1 // 默认为1，表示100%上报，如果设置0.5，就会随机上报
xbossdebug.config.repeat = 5 // 重复上报次数(对于同一个错误超过多少次不上报)
xbossdebug.config.mergeReport = true, // mergeReport 是否合并上报， false 关闭， true 启动（默认）
xbossdebug.config.except = [ /^Script error\.?/, /^Javascript error: Script error\.? on line 0/ ], // 忽略某个错误
```





### 二次开发

##### 1**、安装依赖**

```
// 进入项目目录安装依赖
npm install
// 安装rollup，用于js编译打包
npm install -g rollup
```

##### 2、开发模式 （监听代码变化，生成xbossdebug.js）

```
npm run watch
```

##### 3、编译（生成xbossdebug.min.js）

```
npm run build
```



### [方案设计思想](https://github.com/zhengguorong/xbossdebug/blob/master/design.md)



### TODO

1. 服务端记录数据
2. 数据并可视化
3. 资源加载监控
4. 页面性能监控
5. typescript版本
6. ✅自动化单元测试



### 参考资料

**代码思想参考[fundebug](https://www.fundebug.com/)，如果大家觉得还不错，希望大家支持fundebug的saas服务。**

**代码风格参考https://github.com/gomeplusFED/GER**

## License

[996 License](https://github.com/zhengguorong/h5maker/blob/master/LICENSE)
