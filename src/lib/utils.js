const utils = {
  typeDecide(o, type) {
    return Object.prototype.toString.call(o) === `[object ${type}]`;
  },
  isFunction(f) {
    return utils.typeDecide(f, 'Function');
  },
  isString(f) {
    return utils.typeDecide(f, 'String');
  },
  serializeObj(obj) {
    let parames = '';
    Object.keys(obj).forEach((name) => {
      if (utils.typeDecide(obj[name], 'Object')) {
        parames += `${name}=${utils.stringify(obj[name])}`;
      } else {
        parames += `${name}=${obj[name]}^`;
      }
    });
    return encodeURIComponent(parames.substr(0, parames.length - 1));
  },
  assignObject(obj1, obj2) {
    for (const name in obj2) {
      if (obj2.hasOwnProperty(name)) {
        obj1[name] = obj2[name];
      }
    }
    return obj1;
  },
  noop() {},
  now() {
    return new Date().getTime();
  },
};

export default utils;
