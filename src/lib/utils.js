var utils = {
  typeDecide: function(o, type) {
    return Object.prototype.toString.call(o) === "[object " + type + "]";
  },
  isFunction: function(f) {
    return utils.typeDecide(f, "Function");
  },
  isString: function(f) {
    return utils.typeDecide(f, "String");
  },
  serializeObj: function(obj) {
    let parames = "";
    Object.keys(obj).forEach(name => {
      if (utils.typeDecide(obj[name], "Object")) {
        parames += name + "=" + utils.stringify(obj[name]);
      } else {
        parames += name + "=" + obj[name] + "^";
      }
    });
    return encodeURIComponent(parames.substr(0, parames.length - 1));
  },
  assignObject: function(obj1, obj2) {
    for (let name in obj2) {
      if (obj2.hasOwnProperty(name)) {
        obj1[name] = obj2[name];
      }
    }
    return obj1;
  },
  noop: function() {},
  now: function() {
    return (new Date).getTime()
  }
};

export default utils;
