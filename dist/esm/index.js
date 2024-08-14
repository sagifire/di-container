function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
export var LIFETIME_DYNAMIC = 0;
export var LIFETIME_SINGLETON = 1;
export var TYPE_VALUE = 0;
export var TYPE_FUNCTION = 1;
export var TYPE_CLASS = 2;
export var TYPE_FACTORY = 3;
export var ContainerError = /*#__PURE__*/function (_Error) {
  function ContainerError(message) {
    var _this;
    _classCallCheck(this, ContainerError);
    _this = _callSuper(this, ContainerError, [message]);
    _this.name = "ContainerError";
    return _this;
  }
  _inherits(ContainerError, _Error);
  return _createClass(ContainerError);
}( /*#__PURE__*/_wrapNativeSuper(Error));
export var ContainerConfigError = /*#__PURE__*/function (_ContainerError) {
  function ContainerConfigError(message) {
    var _this2;
    _classCallCheck(this, ContainerConfigError);
    _this2 = _callSuper(this, ContainerConfigError, [message]);
    _this2.name = "ContainerConfigError";
    return _this2;
  }
  _inherits(ContainerConfigError, _ContainerError);
  return _createClass(ContainerConfigError);
}(ContainerError);
export var ContainerCyclicDependenceError = /*#__PURE__*/function (_ContainerError2) {
  function ContainerCyclicDependenceError(message) {
    var _this3;
    _classCallCheck(this, ContainerCyclicDependenceError);
    _this3 = _callSuper(this, ContainerCyclicDependenceError, [message]);
    _this3.name = "ContainerCyclicDependenceError";
    return _this3;
  }
  _inherits(ContainerCyclicDependenceError, _ContainerError2);
  return _createClass(ContainerCyclicDependenceError);
}(ContainerError);
export var Container = /*#__PURE__*/function () {
  function Container(config) {
    _classCallCheck(this, Container);
    this.config = config || {};
    for (var configKey in Container.configDefaults) {
      if (Container.configDefaults.hasOwnProperty(configKey) && 'undefined' === typeof this.config[configKey]) {
        this.config[configKey] = Container.configDefaults[configKey];
      }
    }
    this.registrations = {};
    this.singletons = {};
    this.depsInResolving = new Set();
  }
  return _createClass(Container, [{
    key: "hasRegistration",
    value: function hasRegistration(id) {
      return this.registrations.hasOwnProperty(id);
    }
  }, {
    key: "register",
    value: function register(id) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if ('object' === _typeof(id) && !Array.isArray(id) && null !== id) {
        for (var key in id) {
          if (id.hasOwnProperty(key)) {
            this.register(key, id[key]);
          }
        }
      } else if ('string' === typeof id) {
        if ('undefined' === typeof config.value) {
          throw new ContainerConfigError('Registration value is undefined');
        }
        if ('undefined' === typeof config.type) {
          throw new ContainerConfigError('Registration type is undefined');
        }
        if (![TYPE_VALUE, TYPE_CLASS, TYPE_FACTORY, TYPE_FUNCTION].includes(config.type)) {
          throw new ContainerConfigError('Registration type is invalid');
        }
        if ('undefined' === typeof config.lifetime) {
          config.lifetime = this.config.defaultLifetime;
        }
        if (![LIFETIME_SINGLETON, LIFETIME_DYNAMIC].includes(config.lifetime)) {
          throw new ContainerConfigError('Registration lifetime is invalid');
        }
        if ([TYPE_CLASS, TYPE_FACTORY, TYPE_FUNCTION].includes(config.type)) {
          if ('function' !== typeof config.value) {
            throw new ContainerConfigError('Registration value must be a function');
          }
          if ('undefined' === typeof config.dependencies) {
            if ('undefined' !== typeof config.value._deps) {
              if (!Array.isArray(config.value._deps)) {
                throw new ContainerConfigError('Registration value has invalid _deps');
              }
              config.dependencies = config.value._deps;
            } else {
              config.dependencies = [];
            }
          } else {
            if (!Array.isArray(config.dependencies)) {
              throw new ContainerConfigError('Registration dependencies in config has invalid type');
            }
          }
        }
        if (TYPE_VALUE === config.type) {
          config.lifetime = LIFETIME_DYNAMIC;
        }
        this.registrations[id] = config;
        if ('undefined' !== typeof this.singletons[id]) {
          delete this.singletons[id];
        }
      } else {
        throw new ContainerConfigError('Invalid register id type');
      }
    }
  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(id) {
        var registration, result;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (this.hasRegistration(id)) {
                _context.next = 2;
                break;
              }
              throw new ContainerConfigError("No registration found for id: ".concat(id));
            case 2:
              if (!this.depsInResolving.has(id)) {
                _context.next = 4;
                break;
              }
              throw new ContainerCyclicDependenceError("Dependency cycle detected for id: ".concat(id));
            case 4:
              registration = this.registrations[id];
              this.depsInResolving.add(id);
              if (!(registration.lifetime === LIFETIME_SINGLETON)) {
                _context.next = 14;
                break;
              }
              if (this.singletons.hasOwnProperty(id)) {
                _context.next = 11;
                break;
              }
              _context.next = 10;
              return this.build(registration);
            case 10:
              this.singletons[id] = _context.sent;
            case 11:
              result = this.singletons[id];
              _context.next = 17;
              break;
            case 14:
              _context.next = 16;
              return this.build(registration);
            case 16:
              result = _context.sent;
            case 17:
              this.depsInResolving["delete"](id);
              return _context.abrupt("return", result);
            case 19:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function get(_x) {
        return _get.apply(this, arguments);
      }
      return get;
    }()
  }, {
    key: "build",
    value: function () {
      var _build = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(config) {
        var deps;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              deps = [];
              if (!('undefined' === typeof config.dependencies)) {
                _context2.next = 8;
                break;
              }
              if (!('undefined' !== typeof config.value._deps)) {
                _context2.next = 6;
                break;
              }
              if (Array.isArray(config.value._deps)) {
                _context2.next = 5;
                break;
              }
              throw new ContainerConfigError('Registration value has invalid _deps');
            case 5:
              deps = config.value._deps;
            case 6:
              _context2.next = 9;
              break;
            case 8:
              deps = config.dependencies;
            case 9:
              _context2.t0 = config.type;
              _context2.next = _context2.t0 === TYPE_CLASS ? 12 : _context2.t0 === TYPE_FUNCTION ? 15 : _context2.t0 === TYPE_FACTORY ? 18 : _context2.t0 === TYPE_VALUE ? 21 : 22;
              break;
            case 12:
              _context2.next = 14;
              return this.buildClass(config.value, deps);
            case 14:
              return _context2.abrupt("return", _context2.sent);
            case 15:
              _context2.next = 17;
              return this.buildFunction(config.value, deps);
            case 17:
              return _context2.abrupt("return", _context2.sent);
            case 18:
              _context2.next = 20;
              return this.buildFactory(config.value, config);
            case 20:
              return _context2.abrupt("return", _context2.sent);
            case 21:
              return _context2.abrupt("return", config.value);
            case 22:
              throw new ContainerConfigError("Invalid type for building: ".concat(config.type));
            case 23:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function build(_x2) {
        return _build.apply(this, arguments);
      }
      return build;
    }()
  }, {
    key: "buildClass",
    value: function () {
      var _buildClass = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(classFunction, dependencies) {
        var deps;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return this.resolveDependencies(dependencies);
            case 2:
              deps = _context3.sent;
              return _context3.abrupt("return", new classFunction(deps));
            case 4:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this);
      }));
      function buildClass(_x3, _x4) {
        return _buildClass.apply(this, arguments);
      }
      return buildClass;
    }()
  }, {
    key: "buildFunction",
    value: function () {
      var _buildFunction = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(func, dependencies) {
        var deps;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return this.resolveDependencies(dependencies);
            case 2:
              deps = _context4.sent;
              return _context4.abrupt("return", function () {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }
                return func.apply(void 0, [deps].concat(args));
              });
            case 4:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function buildFunction(_x5, _x6) {
        return _buildFunction.apply(this, arguments);
      }
      return buildFunction;
    }()
  }, {
    key: "buildFactory",
    value: function () {
      var _buildFactory = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(factory, config) {
        var deps, value;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return this.resolveDependencies(config.dependencies || []);
            case 2:
              deps = _context5.sent;
              value = factory(deps, this, config);
              if (!('object' === _typeof(value) && value instanceof Promise)) {
                _context5.next = 8;
                break;
              }
              _context5.next = 7;
              return value;
            case 7:
              value = _context5.sent;
            case 8:
              return _context5.abrupt("return", value);
            case 9:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this);
      }));
      function buildFactory(_x7, _x8) {
        return _buildFactory.apply(this, arguments);
      }
      return buildFactory;
    }()
  }, {
    key: "resolveDependencies",
    value: function () {
      var _resolveDependencies = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(dependencies) {
        var resolvedDeps, _iterator, _step, depId;
        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              resolvedDeps = {};
              _iterator = _createForOfIteratorHelper(dependencies);
              _context6.prev = 2;
              _iterator.s();
            case 4:
              if ((_step = _iterator.n()).done) {
                _context6.next = 11;
                break;
              }
              depId = _step.value;
              _context6.next = 8;
              return this.get(depId);
            case 8:
              resolvedDeps[depId] = _context6.sent;
            case 9:
              _context6.next = 4;
              break;
            case 11:
              _context6.next = 16;
              break;
            case 13:
              _context6.prev = 13;
              _context6.t0 = _context6["catch"](2);
              _iterator.e(_context6.t0);
            case 16:
              _context6.prev = 16;
              _iterator.f();
              return _context6.finish(16);
            case 19:
              return _context6.abrupt("return", resolvedDeps);
            case 20:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this, [[2, 13, 16, 19]]);
      }));
      function resolveDependencies(_x9) {
        return _resolveDependencies.apply(this, arguments);
      }
      return resolveDependencies;
    }()
  }]);
}();
_defineProperty(Container, "configDefaults", {
  defaultLifetime: LIFETIME_SINGLETON
});
var resolveConfigArguments = function resolveConfigArguments(args) {
  var result = {};
  var _iterator2 = _createForOfIteratorHelper(args),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var argument = _step2.value;
      if ('number' === typeof argument) {
        if ('undefined' !== typeof result.lifetime) {
          throw new ContainerConfigError('Seems to duplicate lifetime in arguments');
        }
        result.lifetime = argument;
      } else if (Array.isArray(argument)) {
        if ('undefined' !== typeof result.dependencies) {
          throw new ContainerConfigError('Seems to duplicate dependencies list in arguments');
        }
        result.dependencies = argument;
      } else {
        throw new ContainerConfigError('Can\'t resolve config argument type');
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return result;
};
export var asValue = function asValue(value) {
  return {
    value: value,
    type: TYPE_VALUE
  };
};
export var asClass = function asClass(classValue) {
  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }
  return _objectSpread({
    value: classValue,
    type: TYPE_CLASS
  }, resolveConfigArguments(args));
};
export var asFunction = function asFunction(functionValue) {
  for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    args[_key3 - 1] = arguments[_key3];
  }
  return _objectSpread({
    value: functionValue,
    type: TYPE_FUNCTION
  }, resolveConfigArguments(args));
};
export var asFactory = function asFactory(factoryValue) {
  for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    args[_key4 - 1] = arguments[_key4];
  }
  return _objectSpread({
    value: factoryValue,
    type: TYPE_FACTORY
  }, resolveConfigArguments(args));
};