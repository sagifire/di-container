# @sagifire/di-container - Керівництво розробника (JavaScript)

Ця бібліотека реалізує простий контейнер інверсії керування (IoC) з підтримкою різних типів об'єктів та їх життєвих циклів.

## Сильні сторони:

1.  **Гнучка конфігурація:**
    *   Контейнер підтримує різні типи реєстрацій: значення, класи, функції та фабрики. Це дозволяє користувачам використовувати контейнер у різноманітних сценаріях.
    *   Конфігурація життєвого циклу (`LIFETIME_DYNAMIC`, `LIFETIME_SINGLETON`) дозволяє контролювати, як часто створюються екземпляри об'єктів.

2.  **Динамічне розв'язання залежностей:**
    *   Код підтримує автоматичне розв'язання залежностей через `dependencies`, зменшуючи кількість необхідної ручної конфігурації.

3.  **Чітка обробка помилок:**
    *   Спеціалізовані помилки (`ContainerConfigError`, `ContainerCyclicDependenceError`) використовуються для сповіщення про проблеми конфігурації, покращуючи діагностику проблем.

4.  **Асинхронна підтримка:**
    *   Контейнер дозволяє асинхронне створення об'єктів, що корисно при роботі з промісами або асинхронними фабриками. **Фабрики можуть бути `async` функціями.**

5.  **Обфускація та мініфікація:**
    *   Бібліотека безперебійно працює навіть при застосуванні обфускації та мініфікації коду.

## Слабкі сторони:

1.  Контейнер не підтримує автоматичне впровадження залежностей на основі імен аргументів. Усі залежності мають бути явно зареєстровані.
2.  Немає підтримки циклічних залежностей.
3.  Немає підтримки ізольованих контекстів.

### Мінімалістичний підхід:
*   Контейнер пропонує обмежений набір функцій порівняно з Awilix, що може бути як перевагою, так і недоліком залежно від потреб проекту.

## Огляд

Ця бібліотека використовується для реалізації централізованого управління впровадженням залежностей у компонентах програми.
Контейнер складається з класу `Container`, а також допоміжних функцій `asValue()`, `asClass()`, `asFunction()` та `asFactory()`.

## Створення контейнера та реєстрація компонентів

Щоб використовувати контейнер, спочатку потрібно його визначити та зареєструвати всі системні компоненти, які будуть впроваджуватися як залежності.

```javascript
import {
  Container,
  asValue,
  asFunction,
  asFactory,
  asClass,
  LIFETIME_SINGLETON
} from "@sagifire/di-container";

// Припускаємо, що це JavaScript модулі
import configFactory from "./components/config-factory.js";
import ComponentClass from "./components/some-component.js";

const container = new Container({
  defaultLifetime: LIFETIME_SINGLETON
});

container.register({
  'ENV': asValue('develop'),
  'log': asFunction((deps, ...args) => console.log(...args)),
  'config': asFactory(configFactory), // configFactory може бути асинхронною функцією
  'someComponent': asClass(ComponentClass)
});

export default container;
```

При реєстрації компонента ви можете вказати режим створення: `LIFETIME_DYNAMIC` або `LIFETIME_SINGLETON`.

*   `LIFETIME_DYNAMIC`: Контейнер буде створювати новий екземпляр компонента кожного разу, коли він впроваджується. Недоступно для `asValue()`.
*   `LIFETIME_SINGLETON`: Контейнер створить лише один екземпляр компонента на весь час життя контейнера і завжди буде впроваджувати саме його. Завжди використовується з `asValue()`.

## Типи компонентів

*   ### Значення - `asValue()`
    ```javascript
    { 'key': asValue(someValue) }
    ```
    Використовується для реєстрації будь-якого значення. Завжди використовує `LIFETIME_SINGLETON`. Для цього типу компонента не можна визначити залежності.

*   ### Клас - `asClass()`
    ```javascript
    { 'key': asClass(someClass) }
    ```
    Використовується для реєстрації класів, які пізніше будуть впроваджені як екземпляри цього класу.

*   ### Функція - `asFunction()`
    ```javascript
    { 'key': asFunction(someFunction) }
    ```
    Використовується для реєстрації функцій як компонентів. Функція може отримувати впроваджені залежності як перший аргумент, а інші компоненти можуть викликати її, не турбуючись про її залежності.

*   ### Фабрика - `asFactory()`
    ```javascript
    { 'key': asFactory(someFactory) }
    ```
    Використовується для реєстрації фабрики об'єктів. Фабрика - це функція, яка створює об'єкт компонента і **може бути асинхронною** (повертати Promise). Фабрика може реєструвати свої залежності, як і функція, але завжди повинна повертати об'єкт компонента (або Promise, що резолвиться в нього).

## Додаткові параметри реєстрації компонентів
У функціях `asClass()`, `asFunction()` та `asFactory()` ви можете передати додаткові параметри.

*   `LIFETIME_DYNAMIC` або `LIFETIME_SINGLETON` для визначення методу контролю створення компонента.
*   Ви також можете передати масив залежностей, який буде використаний замість тих, що визначені через поле `_deps` у самому компоненті.

Порядок цих аргументів не має значення.

Приклад:
```javascript
// Припускаємо, що componentClass та randomFactory визначені деінде
container.register({
    'component': asClass(componentClass, ['config', 'log'], LIFETIME_SINGLETON),
    'randomObject': asFactory(randomFactory, LIFETIME_DYNAMIC, ['component']) // randomFactory може бути асинхронною
});
```

## Визначення залежностей у компонентах
Кожен зареєстрований компонент може отримати доступ до іншого зареєстрованого компонента через впровадження залежностей. Для цього потрібно явно визначити залежності через статичне поле `_deps`. Тоді залежність буде доступна через об'єкт `deps`, який передається за замовчуванням у конструктор компонента, або як перший параметр, якщо компонент є функцією.

Приклад:
```javascript
// components/some-component.js
export default class ComponentClass {
  static _deps = [
    "config",
    "log"
  ];

  constructor(deps) {
    this.deps = deps;
    if (this.deps.config.enable_logs) {
      this.deps.log('Компонент створено!');
    }
  }
}
```

Якщо вам потрібно використовувати функцію як компонент, ви повинні створити поле `_deps` на об'єкті функції для визначення залежностей.

Приклад:
```javascript
// components/config-factory.js
// Припускаємо, що loadConfigFile - це асинхронна функція, що повертає Promise
const configFactory = async (deps) => {
  const configFileData = await loadConfigFile('path/to/config.json'); // Приклад шляху
  deps.log('Конфігурацію завантажено');
  return {
    host: 'localhost',
    port: 8080,
    enable_logs: false,
    ...configFileData
  };
};

configFactory._deps = [
  'log'
];

export default configFactory;
```


## Впровадження залежностей поза зареєстрованими компонентами
Іноді необхідно впровадити зареєстровані компоненти контейнера в об'єкт або функцію, які не є компонентами контейнера і не зареєстровані в ньому. Для цього можна використовувати метод `build()` контейнера.

```javascript
import { asClass } from '@sagifire/di-container';
import myContainer from './my-container.js'; // Припускаємо, що цей файл експортує ваш налаштований контейнер

class MyClass {
  static _deps = ['log'];

  constructor(deps) {
    this.deps = deps;
  }

  run() {
    this.deps.log('Запуск MyClass');
  }
}

// Оскільки build може обробляти асинхронні фабрики/залежності, він повертає Promise
async function initializeMyClass() {
  const myObject = await myContainer.build(asClass(MyClass));
  myObject.run();
}

initializeMyClass();
```

## Успадкування в компонентах
Іноді потрібно реалізувати підклас певного класу. У цьому випадку ви можете розділити визначення залежностей відповідно до логіки їх використання.

```javascript
class BaseClass {
  static _deps = ['log'];

  constructor(deps) {
    this.deps = deps;
    this.deps.log('BaseClass сконструйовано');
  }
}

class ChildClass extends BaseClass {
  // Успадковуємо та додаємо залежності
  static _deps = BaseClass._deps.concat([
    'config'
  ]);

  constructor(deps) {
    super(deps); // Викликаємо конструктор BaseClass
    this.deps.log('ChildClass сконструйовано');
    if (this.deps.config.some_setting) {
        // Використовуємо залежність config
    }
  }
}

// Реєструємо ChildClass у контейнері
// container.register({ 'child': asClass(ChildClass) });
