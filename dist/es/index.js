var y = Object.defineProperty;
var h = (r, e, n) => e in r ? y(r, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : r[e] = n;
var o = (r, e, n) => h(r, typeof e != "symbol" ? e + "" : e, n);
const E = 0, T = 1, g = 0, I = 1, C = 2, m = 3;
class a extends Error {
  constructor(e) {
    super(e), this.name = "ContainerError";
  }
}
class s extends a {
  constructor(e) {
    super(e), this.name = "ContainerConfigError";
  }
}
class w extends a {
  constructor(e) {
    super(e), this.name = "ContainerCyclicDependenceError";
  }
}
const l = class l {
  // Множина для відстеження циклічних залежностей
  constructor(e) {
    // Властивості класу з типами
    o(this, "config");
    // Конфігурація контейнера (робимо її Required)
    o(this, "registrations");
    // Мапа реєстрацій
    o(this, "singletons");
    // Кеш синглтонів
    o(this, "depsInResolving");
    this.config = { ...l.configDefaults, ...e }, this.registrations = {}, this.singletons = {}, this.depsInResolving = /* @__PURE__ */ new Set();
  }
  /**
   * Перевіряє, чи існує реєстрація з вказаним ID.
   * @param id - Ідентифікатор залежності.
   * @returns true, якщо реєстрація існує, інакше false.
   */
  hasRegistration(e) {
    return Object.prototype.hasOwnProperty.call(this.registrations, e);
  }
  /**
   * Реєструє залежність або набір залежностей.
   * @param id - Ідентифікатор залежності або об'єкт з реєстраціями.
   * @param config - Конфігурація реєстрації (якщо id - рядок).
   */
  register(e, n = null) {
    if (typeof e == "object" && !Array.isArray(e) && e !== null) {
      for (const t in e)
        if (Object.prototype.hasOwnProperty.call(e, t)) {
          const i = e[t];
          if (typeof i != "object" || i === null || typeof i.type > "u" || typeof i.value > "u")
            throw new s(`Invalid configuration provided for key "${t}" during bulk registration.`);
          this.register(t, i);
        }
    } else if (typeof e == "string") {
      if (!n)
        throw new s(`Configuration is required when registering with string ID: ${e}`);
      const t = { ...n };
      if (typeof t.value > "u")
        throw new s("Registration value is undefined");
      if (typeof t.type > "u")
        throw new s("Registration type is undefined");
      if (![0, 2, 3, 1].includes(t.type))
        throw new s("Registration type is invalid");
      if (typeof t.lifetime > "u" && (t.lifetime = this.config.defaultLifetime), ![1, 0].includes(t.lifetime))
        throw new s("Registration lifetime is invalid");
      if ([2, 3, 1].includes(t.type)) {
        if (typeof t.value != "function")
          throw new s("Registration value must be a function for CLASS, FACTORY, or FUNCTION types");
        if (typeof t.dependencies > "u" && (t.dependencies = [], typeof t.value._deps < "u" && (t.dependencies = t.value._deps)), Array.isArray(t.dependencies)) {
          if (!t.dependencies.every((u) => typeof u == "string"))
            throw new s("Registration dependencies must be an array of strings");
        } else throw new s("Registration dependencies must be an array");
      }
      t.type === 0 && (t.lifetime = 0), this.registrations[e] = t, Object.prototype.hasOwnProperty.call(this.singletons, e) && delete this.singletons[e];
    } else
      throw new s("Invalid register id type. Must be a string or an object.");
  }
  /**
   * Отримує екземпляр залежності за її ID.
   * @param id - Ідентифікатор залежності.
   * @returns Проміс, який розв'язується екземпляром залежності.
   * @template T - Явно вказаний тип залежності (перевизначає тип зі схеми).
   * @template K - Тип ідентифікатора залежності, обмежений ключами схеми або DependencyId.
   */
  // Оновлюємо сигнатуру методу get
  async get(e) {
    if (!this.hasRegistration(e))
      throw new s(`No registration found for id: ${e}`);
    if (this.depsInResolving.has(e))
      throw new w(`Dependency cycle detected for id: ${e}`);
    const n = this.registrations[e];
    let t;
    this.depsInResolving.add(e);
    try {
      n.lifetime === 1 ? (Object.prototype.hasOwnProperty.call(this.singletons, e) || (this.singletons[e] = await this.build(n)), t = this.singletons[e]) : t = await this.build(n);
    } catch (i) {
      throw i instanceof a ? i : new a(`Error while resolving dependency "${e}": ${String(i)}`);
    } finally {
      this.depsInResolving.delete(e);
    }
    return t;
  }
  /**
   * Внутрішній метод для побудови екземпляра залежності на основі конфігурації.
   * @param config - Конфігурація реєстрації.
   * @returns Проміс, який розв'язується екземпляром залежності.
   * @template T - Очікуваний тип залежності.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async build(e) {
    var t;
    if (e.value && e.value._deps !== void 0 && !Array.isArray(e.value._deps))
      throw new s("Invalid dependencies format in value. Expected an array.");
    const n = e.dependencies || ((t = e == null ? void 0 : e.value) == null ? void 0 : t._deps) || [];
    switch (e.type) {
      case 2:
        if (typeof e.value != "function" || !e.value.prototype)
          throw new s("Value for CLASS registration must be a class constructor.");
        return await this.buildClass(e.value, n);
      case 1:
        if (typeof e.value != "function")
          throw new s("Value for FUNCTION registration must be a function.");
        const i = e.value, d = await this.resolveDependencies(n);
        return (...u) => i(d, ...u);
      // Приведення типу може бути не зовсім точним тут
      case 3:
        if (typeof e.value != "function")
          throw new s("Value for FACTORY registration must be a function.");
        return await this.buildFactory(e.value, e);
      case 0:
        return e.value;
      default:
        const f = e.type;
        throw new s(`Unhandled registration type: ${f}`);
    }
  }
  /**
   * Будує екземпляр класу з розв'язаними залежностями.
   * @param classConstructor - Конструктор класу.
   * @param dependencies - Список ID залежностей.
   * @returns Проміс, який розв'язується екземпляром класу.
   * @template T - Тип класу.
   */
  async buildClass(e, n) {
    const t = await this.resolveDependencies(n);
    return new e(t);
  }
  // buildFunction тепер обробляється безпосередньо в build методі
  /**
   * Викликає фабричну функцію з розв'язаними залежностями.
   * @param factory - Фабрична функція.
   * @param config - Повна конфігурація реєстрації.
   * @returns Проміс, який розв'язується значенням, повернутим фабрикою.
   * @template T - Очікуваний тип значення.
   */
  // Оновлюємо сигнатуру buildFactory, щоб приймати FactoryFunction з відповідною схемою
  async buildFactory(e, n) {
    const t = await this.resolveDependencies(n.dependencies || []);
    let i = e(t, this, n);
    return typeof i == "object" && i !== null && i instanceof Promise && (i = await i), i;
  }
  /**
   * Розв'язує список залежностей, отримуючи їх екземпляри з контейнера.
   * @param dependencies - Масив ID залежностей.
   * @returns Проміс, який розв'язується об'єктом з розв'язаними залежностями.
   */
  async resolveDependencies(e) {
    const n = {};
    for (const t of e)
      n[t] = await this.get(t);
    return n;
  }
};
// Статичні налаштування за замовчуванням
o(l, "configDefaults", {
  // Використовуємо Required для гарантії наявності всіх полів
  defaultLifetime: 1
});
let p = l;
const c = (r) => {
  const e = {};
  for (const n of r)
    if (typeof n == "number") {
      if (typeof e.lifetime < "u")
        throw new s("Seems to duplicate lifetime in arguments");
      if (![0, 1].includes(n))
        throw new s("Invalid lifetime value provided in arguments");
      e.lifetime = n;
    } else if (Array.isArray(n)) {
      if (typeof e.dependencies < "u")
        throw new s("Seems to duplicate dependencies list in arguments");
      if (!n.every((t) => typeof t == "string"))
        throw new s("Dependencies list must contain only strings");
      e.dependencies = n;
    } else
      throw new s(`Can't resolve config argument type: ${typeof n}`);
  return e;
}, A = (r) => ({
  value: r,
  type: 0
  // lifetime автоматично встановлюється в DYNAMIC в методі register
}), L = (r, ...e) => ({
  value: r,
  type: 2,
  ...c(e)
  // Розбираємо додаткові аргументи
}), _ = (r, ...e) => ({
  value: r,
  type: 1,
  ...c(e)
  // Розбираємо додаткові аргументи
}), Y = (r, ...e) => ({
  value: r,
  type: 3,
  ...c(e)
  // Розбираємо додаткові аргументи
});
export {
  p as Container,
  s as ContainerConfigError,
  w as ContainerCyclicDependenceError,
  a as ContainerError,
  E as LIFETIME_DYNAMIC,
  T as LIFETIME_SINGLETON,
  C as TYPE_CLASS,
  m as TYPE_FACTORY,
  I as TYPE_FUNCTION,
  g as TYPE_VALUE,
  L as asClass,
  Y as asFactory,
  _ as asFunction,
  A as asValue
};
//# sourceMappingURL=index.js.map
