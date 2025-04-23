var y = Object.defineProperty;
var h = (i, e, n) => e in i ? y(i, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : i[e] = n;
var a = (i, e, n) => h(i, typeof e != "symbol" ? e + "" : e, n);
const g = 0, T = 1, v = 0, I = 1, C = 2, m = 3;
class p extends Error {
  constructor(e) {
    super(e), this.name = "ContainerError";
  }
}
class s extends p {
  constructor(e) {
    super(e), this.name = "ContainerConfigError";
  }
}
class w extends p {
  constructor(e) {
    super(e), this.name = "ContainerCyclicDependenceError";
  }
}
const u = class u {
  // Множина для відстеження циклічних залежностей
  constructor(e) {
    // Властивості класу з типами
    a(this, "config");
    // Конфігурація контейнера (робимо її Required)
    a(this, "registrations");
    // Мапа реєстрацій
    a(this, "singletons");
    // Кеш синглтонів
    a(this, "depsInResolving");
    this.config = { ...u.configDefaults, ...e }, this.registrations = {}, this.singletons = {}, this.depsInResolving = /* @__PURE__ */ new Set();
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
          const r = e[t];
          if (typeof r != "object" || r === null || typeof r.type > "u" || typeof r.value > "u")
            throw new s(`Invalid configuration provided for key "${t}" during bulk registration.`);
          this.register(t, r);
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
        if (typeof t.dependencies > "u")
          t.dependencies = [];
        else if (Array.isArray(t.dependencies)) {
          if (!t.dependencies.every((d) => typeof d == "string"))
            throw new s("Registration dependencies must be an array of strings");
        } else throw new s("Registration dependencies must be an array");
        delete t._deps;
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
    const n = e.dependencies || [];
    switch (e.type) {
      case 2:
        if (typeof e.value != "function" || !e.value.prototype)
          throw new s("Value for CLASS registration must be a class constructor.");
        return await this.buildClass(e.value, n);
      case 1:
        if (typeof e.value != "function")
          throw new s("Value for FUNCTION registration must be a function.");
        const t = e.value, r = await this.resolveDependencies(n);
        return (...l) => t(r, ...l);
      // Приведення типу може бути не зовсім точним тут
      case 3:
        if (typeof e.value != "function")
          throw new s("Value for FACTORY registration must be a function.");
        return await this.buildFactory(e.value, e);
      case 0:
        return e.value;
      default:
        const o = e.type;
        throw new s(`Unhandled registration type: ${o}`);
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
    let r = e(t, this, n);
    return typeof r == "object" && r !== null && r instanceof Promise && (r = await r), r;
  }
  /**
   * Розв'язує список залежностей, отримуючи їх екземпляри з контейнера.
   * @param dependencies - Масив ID залежностей.
   * @returns Проміс, який розв'язується об'єктом з розв'язаними залежностями.
   */
  async resolveDependencies(e) {
    const n = {}, t = e.map((o) => this.get(o)), r = await Promise.all(t);
    return e.forEach((o, l) => {
      n[o] = r[l];
    }), n;
  }
};
// Статичні налаштування за замовчуванням
a(u, "configDefaults", {
  // Використовуємо Required для гарантії наявності всіх полів
  defaultLifetime: 1
});
let f = u;
const c = (i) => {
  const e = {};
  for (const n of i)
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
}, L = (i) => ({
  value: i,
  type: 0
  // lifetime автоматично встановлюється в DYNAMIC в методі register
}), Y = (i, ...e) => ({
  value: i,
  type: 2,
  ...c(e)
  // Розбираємо додаткові аргументи
}), A = (i, ...e) => ({
  value: i,
  type: 1,
  ...c(e)
  // Розбираємо додаткові аргументи
}), F = (i, ...e) => ({
  value: i,
  type: 3,
  ...c(e)
  // Розбираємо додаткові аргументи
});
export {
  f as Container,
  s as ContainerConfigError,
  w as ContainerCyclicDependenceError,
  p as ContainerError,
  g as LIFETIME_DYNAMIC,
  T as LIFETIME_SINGLETON,
  C as TYPE_CLASS,
  m as TYPE_FACTORY,
  I as TYPE_FUNCTION,
  v as TYPE_VALUE,
  Y as asClass,
  F as asFactory,
  A as asFunction,
  L as asValue
};
//# sourceMappingURL=index.js.map
