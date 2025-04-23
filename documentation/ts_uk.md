# @sagifire/di-container - Керівництво розробника (TypeScript)

Ця бібліотека реалізує простий контейнер інверсії керування (IoC) з підтримкою різних типів об'єктів та їх життєвих циклів, повністю сумісний з TypeScript.

## Сильні сторони:

1.  **Гнучка конфігурація:**
    *   Контейнер підтримує різні типи реєстрацій: значення, класи, функції та фабрики. Це дозволяє користувачам використовувати контейнер у різноманітних сценаріях з безпекою типів.
    *   Конфігурація життєвого циклу (`LIFETIME_DYNAMIC`, `LIFETIME_SINGLETON`) дозволяє контролювати, як часто створюються екземпляри об'єктів.

2.  **Динамічне розв'язання залежностей:**
    *   Код підтримує автоматичне розв'язання залежностей через `dependencies`, зменшуючи кількість необхідної ручної конфігурації. TypeScript допомагає переконатися, що імена залежностей збігаються.

3.  **Чітка обробка помилок:**
    *   Спеціалізовані помилки (`ContainerConfigError`, `ContainerCyclicDependenceError`) використовуються для сповіщення про проблеми конфігурації, покращуючи діагностику проблем.

4.  **Асинхронна підтримка:**
    *   Контейнер дозволяє асинхронне створення об'єктів за допомогою `async/await`, що корисно при роботі з промісами або асинхронними фабриками. **Фабрики можуть бути `async` функціями.**

5.  **Обфускація та мініфікація:**
    *   Бібліотека безперебійно працює навіть при застосуванні обфускації та мініфікації коду.

## Слабкі сторони:

1.  Контейнер не підтримує автоматичне впровадження залежностей на основі імен або типів аргументів. Усі залежності мають бути явно зареєстровані за рядковими ключами.
2.  Немає підтримки циклічних залежностей.
3.  Немає підтримки ізольованих контекстів.

### Мінімалістичний підхід:
*   Контейнер пропонує обмежений набір функцій порівняно з Awilix, що може бути як перевагою, так і недоліком залежно від потреб проекту.

## Огляд

Ця бібліотека використовується для реалізації централізованого управління впровадженням залежностей у компонентах програми за допомогою TypeScript.
Контейнер складається з класу `Container`, а також допоміжних функцій `asValue()`, `asClass()`, `asFunction()` та `asFactory()`.

## Створення контейнера та реєстрація компонентів

Щоб використовувати контейнер, спочатку потрібно його визначити та зареєструвати всі системні компоненти, які будуть впроваджуватися як залежності. Визначте інтерфейси або типи для ваших залежностей для кращої безпеки типів.

```typescript
import {
  Container,
  asValue,
  asFunction,
  asFactory,
  asClass,
  LIFETIME_SINGLETON,
  type IDependencies // Припускаємо, що бібліотека експортує цей тип або ви його визначаєте
} from "@sagifire/di-container";

// Визначте інтерфейси для ваших компонентів та залежностей
interface IConfig {
  host: string;
  port: number;
  enable_logs: boolean;
  // інші властивості конфігурації
}

interface ILogger {
  log: (...args: any[]) => void;
  // інші методи логера
}

interface ISomeComponent {
  // методи/властивості компонента
}

// Визначте тип вашої мапи залежностей
interface AppDependencies extends IDependencies {
  ENV: string;
  log: ILogger;
  config: IConfig;
  someComponent: ISomeComponent;
}

// Припускаємо, що це TypeScript модулі/класи
import configFactory from "./components/config-factory"; // Може бути асинхронною функцією
import ComponentClass from "./components/some-component"; // Клас TS
import { createLogger } from "./components/logger"; // Функція TS

const container = new Container<AppDependencies>({ // Використовуйте дженеріки для безпеки типів
  defaultLifetime: LIFETIME_SINGLETON
});

container.register({
  // Імена ключів повинні відповідати AppDependencies
  'ENV': asValue('develop'),
  'log': asFunction(createLogger), // createLogger повинен відповідати (deps: AppDependencies, ...args) => ILogger
  'config': asFactory(configFactory), // configFactory повинен відповідати (deps: AppDependencies) => Promise<IConfig> або IConfig
  'someComponent': asClass(ComponentClass) // Конструктор ComponentClass повинен приймати (deps: AppDependencies)
});

export default container;
```

При реєстрації компонента ви можете вказати режим створення: `LIFETIME_DYNAMIC` або `LIFETIME_SINGLETON`.

*   `LIFETIME_DYNAMIC`: Контейнер буде створювати новий екземпляр компонента кожного разу, коли він впроваджується. Недоступно для `asValue()`.
*   `LIFETIME_SINGLETON`: Контейнер створить лише один екземпляр компонента на весь час життя контейнера і завжди буде впроваджувати саме його. Завжди використовується з `asValue()`.

## Типи компонентів

*   ### Значення - `asValue()`
    ```typescript
    { 'key': asValue<ValueType>(someValue) } // Опціональний дженерік для типу значення
    ```
    Використовується для реєстрації будь-якого значення. Завжди використовує `LIFETIME_SINGLETON`. Для цього типу компонента не можна визначити залежності.

*   ### Клас - `asClass()`
    ```typescript
    { 'key': asClass<InstanceType>(SomeClass) } // Опціональний дженерік для типу екземпляра класу
    ```
    Використовується для реєстрації класів, які пізніше будуть впроваджені як екземпляри цього класу. Конструктор отримує типізовані залежності.

*   ### Функція - `asFunction()`
    ```typescript
    { 'key': asFunction<ReturnType>(someFunction) } // Опціональний дженерік для типу повернення функції
    ```
    Використовується для реєстрації функцій як компонентів. Функція отримує типізовані залежності як перший аргумент.

*   ### Фабрика - `asFactory()`
    ```typescript
    { 'key': asFactory<ReturnType>(someFactory) } // Опціональний дженерік для типу повернення фабрики
    ```
    Використовується для реєстрації фабрики об'єктів. Фабрика - це функція, яка створює об'єкт компонента і **може бути асинхронною** (повертати `Promise`). Фабрика отримує типізовані залежності і завжди повинна повертати об'єкт компонента (або Promise, що резолвиться в нього).

## Додаткові параметри реєстрації компонентів
У функціях `asClass()`, `asFunction()` та `asFactory()` ви можете передати додаткові параметри.

*   `LIFETIME_DYNAMIC` або `LIFETIME_SINGLETON` для визначення методу контролю створення компонента.
*   Ви також можете передати масив ключів залежностей (рядків), який буде використаний замість тих, що визначені через статичне поле `_deps` у самому компоненті.

Порядок цих аргументів не має значення.

Приклад:
```typescript
// Припускаємо, що ComponentClass та randomFactory є визначеними класами/функціями TS
// І AppDependencies визначає 'config', 'log', 'component'
container.register({
    'component': asClass<ISomeComponent>(ComponentClass, ['config', 'log'], LIFETIME_SINGLETON),
    'randomObject': asFactory<any>(randomFactory, LIFETIME_DYNAMIC, ['component']) // randomFactory може бути асинхронною
});
```

## Визначення залежностей у компонентах
Кожен зареєстрований компонент може отримати доступ до іншого зареєстрованого компонента через впровадження залежностей. Для цього потрібно явно визначити залежності через статичне поле `_deps` (масив рядків). Тоді залежність буде доступна через об'єкт `deps` (типізований на основі дженерік-типу контейнера), який передається за замовчуванням у конструктор компонента, або як перший параметр, якщо компонент є функцією.

Приклад:
```typescript
// components/some-component.ts
import type { AppDependencies } from "../container"; // Імпортуємо тип мапи залежностей
import type { ISomeComponent, IConfig, ILogger } from "../interfaces"; // Імпортуємо інтерфейси компонентів/залежностей

export default class ComponentClass implements ISomeComponent {
  // Ключі залежностей повинні відповідати AppDependencies
  static _deps: Array<keyof AppDependencies> = [
    "config",
    "log"
  ];

  private config: IConfig;
  private log: ILogger;

  constructor(deps: AppDependencies) {
    // Доступ до залежностей з безпекою типів
    this.config = deps.config;
    this.log = deps.log;

    if (this.config.enable_logs) {
      this.log.log('Компонент створено!');
    }
  }

  // Реалізуємо методи ISomeComponent...
}
```

Якщо вам потрібно використовувати функцію як компонент, ви повинні створити поле `_deps` на об'єкті функції для визначення залежностей.

Приклад:
```typescript
// components/config-factory.ts
import type { AppDependencies } from "../container";
import type { IConfig, ILogger } from "../interfaces";
// Припускаємо, що loadConfigFile - це асинхронна функція, що повертає Promise<Partial<IConfig>>
import { loadConfigFile } from "../utils/file-loader";

// Сигнатура фабричної функції відповідає вимогам asFactory
const configFactory = async (deps: AppDependencies): Promise<IConfig> => {
  // Безпека типів для deps.log
  const log: ILogger = deps.log;
  const configFileData = await loadConfigFile('path/to/config.json'); // Приклад шляху
  log.log('Конфігурацію завантажено');
  return {
    host: 'localhost',
    port: 8080,
    enable_logs: false,
    ...configFileData // Розгортаємо завантажену конфігурацію
  };
};

// Визначаємо залежності для фабричної функції
configFactory._deps: Array<keyof AppDependencies> = [
  'log'
];

export default configFactory;
```


## Впровадження залежностей поза зареєстрованими компонентами
Іноді необхідно впровадити зареєстровані компоненти контейнера в об'єкт або функцію, які не є компонентами контейнера і не зареєстровані в ньому. Для цього можна використовувати метод `build()` контейнера. `build` також є дженеріком для безпеки типів.

```typescript
import { asClass } from '@sagifire/di-container';
import myContainer from './my-container'; // Припускаємо, що цей файл експортує ваш типізований екземпляр контейнера
import type { AppDependencies } from './my-container'; // Імпортуємо тип мапи залежностей
import type { ILogger } from './interfaces';

class MyClass {
  // Визначаємо залежності
  static _deps: Array<keyof AppDependencies> = ['log'];

  private log: ILogger;

  constructor(deps: Pick<AppDependencies, 'log'>) { // Отримуємо лише необхідні залежності
    this.log = deps.log;
  }

  run(): void {
    this.log.log('Запуск MyClass');
  }
}

// Оскільки build може обробляти асинхронні фабрики/залежності, він повертає Promise
// Використовуємо дженерік для вказівки очікуваного типу повернення
async function initializeMyClass(): Promise<void> {
  const myObject = await myContainer.build<MyClass>(asClass(MyClass));
  myObject.run();
}

initializeMyClass();
```

## Успадкування в компонентах
Іноді потрібно реалізувати підклас певного класу. У цьому випадку ви можете розділити визначення залежностей відповідно до логіки їх використання, використовуючи успадкування TypeScript.

```typescript
import type { AppDependencies } from "../container";
import type { ILogger, IConfig } from "../interfaces";

class BaseClass {
  static _deps: Array<keyof AppDependencies> = ['log'];
  protected log: ILogger; // Використовуємо protected для доступу підкласів

  constructor(deps: Pick<AppDependencies, 'log'>) {
    this.log = deps.log;
    this.log.log('BaseClass сконструйовано');
  }
}

class ChildClass extends BaseClass {
  // Успадковуємо та додаємо залежності, використовуючи keyof для безпеки
  static _deps: Array<keyof AppDependencies> = BaseClass._deps.concat([
    'config'
  ]);

  private config: IConfig;

  // Конструктор отримує всі залежності, визначені в _deps
  constructor(deps: Pick<AppDependencies, 'log' | 'config'>) {
    super(deps); // Викликаємо конструктор BaseClass з відповідною частиною deps
    this.config = deps.config; // Доступ до власної залежності
    this.log.log('ChildClass сконструйовано'); // Доступ до успадкованої залежності через this.log
    if (this.config.some_setting) {
        // Використовуємо залежність config
    }
  }
}

// Реєструємо ChildClass у контейнері
// container.register({ 'child': asClass<ChildClass>(ChildClass) });
