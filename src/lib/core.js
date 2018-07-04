import config from "./config";
import events from "./events";
import report from "./report";
import utils from "./utils";

class XbossDebug extends events(report(config)) {
  constructor(options) {
    super(options);
    this.breadcrumbs = []; // 函数执行面包屑
    this.activePage = {};
    this.rewriteApp();
    this.rewritePage();
  }
  // 劫持原小程序App方法
  rewriteApp() {
    var originApp = App,
      self = this;
    App = function(app) {
      // 合并方法，插入记录脚本
      ["onLaunch", "onShow", "onHide", "onError"].forEach(methodName => {
        var userDefinedMethod = app[methodName]; // 暂存用户定义的方法
        app[methodName] = function(options) {
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
          "onError" === methodName && self.error({ msg: options }); // 错误上报
          userDefinedMethod && userDefinedMethod.call(this, options);
          if ('onLaunch' == methodName) {
            self.getNetworkType();
            self.config.setLocation && self.getLocation();
            self.config.setSystemInfo && self.getSystemInfo();
          }
        };
      });
      originApp(app);
    };
  }
  // 劫持原小程序Page方法
  rewritePage() {
    var originPage = Page;
    Page = page => {
      Object.keys(page).forEach(methodName => {
        "function" == typeof page[methodName] &&
          this.recordPageFn(page, methodName);
      });
      // 强制记录两生命周期函数
      page["onReady"] || this.recordPageFn(page, "onReady");
      page["onLoad"] || this.recordPageFn(page, "onLoad");
      // 执行原Page对象
      originPage(page);
    };
  }

  // 获取当前显示的页面
  getActivePage() {
    var curPages = getCurrentPages();
    if (curPages.length) return curPages[curPages.length - 1];
  }
  // 记录函数执行情况，最多记录20个
  pushToBreadcrumb(obj) {
    this.breadcrumbs.push(obj),
      this.breadcrumbs.length > 20 && this.breadcrumbs.shift();
  }
  // 记录Page执行信息
  recordPageFn(page, methodName) {
    var userDefinedMethod = page[methodName],
      self = this;
    page[methodName] = function() {
      if ("onLoad" === methodName || "onShow" === methodName)
        self.activePage = self.getActivePage();
      var breadcrumb = {
        type: "function",
        time: utils.now(),
        belong: "Page",
        method: methodName,
        route: self.activePage && self.activePage.route,
        options: self.activePage && self.activePage.options
      };
      "onLoad" === methodName && (breadcrumb.args = arguments);
      self.methodFilter(methodName) && self.pushToBreadcrumb(breadcrumb);
      return userDefinedMethod && userDefinedMethod.apply(this, arguments);
    };
  }
  // 过滤方法，可以在这里做黑白名单
  methodFilter(methodName) {
    return "onPageScroll" !== methodName; // 把onPageScroll方法过滤掉
  }
  getNetworkType() {
    wx.getNetworkType({
      success: res => {
        this.networkType = res.networkType;
      }
    });
  }
  getSystemInfo() {
    wx.getSystemInfo({
      success: res => {
        this.systemInfo = res;
      }
    });
  }
  getLocation() {
    wx.getLocation({
      type: "wgs84",
      success: res => {
        this.locationInfo = res;
      }
    });
  }
}

var xbossdebug = new XbossDebug();

export default xbossdebug;
