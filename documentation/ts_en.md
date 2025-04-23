# @sagifire/di-container - Developer Guide (TypeScript)

This library implements a simple Inversion of Control (IoC) container with support for various object types and lifetimes, fully compatible with TypeScript.

## Strong Points:

1.  **Flexible Configuration:**
    *   The container supports different types of registrations: values, classes, functions, and factories. This allows users to utilize the container in various scenarios with type safety.
    *   The lifecycle configuration (`LIFETIME_DYNAMIC`, `LIFETIME_SINGLETON`) lets you control how often instances of objects are created.

2.  **Dynamic Dependency Resolution:**
    *   The code supports automatic dependency resolution through `dependencies`, reducing the amount of manual configuration needed. TypeScript helps ensure the dependency names match.

3.  **Clear Error Handling:**
    *   Specialized errors (`ContainerConfigError`, `ContainerCyclicDependenceError`) are used to notify about configuration problems, improving problem diagnosis.

4.  **Asynchronous Support:**
    *   The container allows for asynchronous object creation using `async/await`, which is useful when working with promises or asynchronous factories. **Factories can be `async` functions.**

5.  **Obfuscation and Minification:**
    *   The library works seamlessly even when code obfuscation and minification are applied.

## Weak Points:

1.  The container does not support automatic dependency injection based on argument names or types. All dependencies must be explicitly registered by string keys.
2.  There is no support for cyclic dependencies.
3.  No support for isolated contexts.

### Minimalistic Approach:
*   The container offers a limited set of features compared to Awilix, which can be both an advantage and a disadvantage depending on the project's needs.

## Overview

This library is used to implement centralized dependency injection management in application components using TypeScript.
The container consists of the `Container` class, along with helper functions `asValue()`, `asClass()`, `asFunction()`, and `asFactory()`.

## Creating a Container and Registering Components

To use the container, you first need to define it and register all the system components that will be injected as dependencies. Define interfaces or types for your dependencies for better type safety.

```typescript
import {
  Container,
  asValue,
  asFunction,
  asFactory,
  asClass,
  LIFETIME_SINGLETON,
  type IDependencies // Assuming the library exports this type or you define it
} from "@sagifire/di-container";

// Define interfaces for your components and dependencies
interface IConfig {
  host: string;
  port: number;
  enable_logs: boolean;
  // other config props
}

interface ILogger {
  log: (...args: any[]) => void;
  // other log methods
}

interface ISomeComponent {
  // component methods/properties
}

// Define your dependency map type
interface AppDependencies extends IDependencies {
  ENV: string;
  log: ILogger;
  config: IConfig;
  someComponent: ISomeComponent;
}

// Assuming these are TypeScript modules/classes
import configFactory from "./components/config-factory"; // Can be async function
import ComponentClass from "./components/some-component"; // A TS class
import { createLogger } from "./components/logger"; // A TS function

const container = new Container<AppDependencies>({ // Use generics for type safety
  defaultLifetime: LIFETIME_SINGLETON
});

container.register({
  // Key names must match AppDependencies
  'ENV': asValue('develop'),
  'log': asFunction(createLogger), // createLogger should match (deps: AppDependencies, ...args) => ILogger
  'config': asFactory(configFactory), // configFactory should match (deps: AppDependencies) => Promise<IConfig> or IConfig
  'someComponent': asClass(ComponentClass) // ComponentClass constructor should accept (deps: AppDependencies)
});

export default container;
```

When registering a component, you can specify the creation mode: `LIFETIME_DYNAMIC` or `LIFETIME_SINGLETON`.

*   `LIFETIME_DYNAMIC`: The container will recreate a new instance of the component each time it is injected. Not available for `asValue()`.
*   `LIFETIME_SINGLETON`: The container will create only one instance of the component for the lifetime of the container and will always inject it. Always used with `asValue()`.

## Component Types

*   ### Value - `asValue()`
    ```typescript
    { 'key': asValue<ValueType>(someValue) } // Optional generic for value type
    ```
    Used for registering any value. Always uses `LIFETIME_SINGLETON`. Dependencies cannot be defined for this component type.

*   ### Class - `asClass()`
    ```typescript
    { 'key': asClass<InstanceType>(SomeClass) } // Optional generic for class instance type
    ```
    Used for registering classes that will later be injected as instances of this class. The constructor receives typed dependencies.

*   ### Function - `asFunction()`
    ```typescript
    { 'key': asFunction<ReturnType>(someFunction) } // Optional generic for function return type
    ```
    Used for registering functions as components. The function receives typed dependencies as the first argument.

*   ### Factory - `asFactory()`
    ```typescript
    { 'key': asFactory<ReturnType>(someFactory) } // Optional generic for factory return type
    ```
    Used for registering an object factory. A factory is a function that creates a component object and **can be asynchronous** (return a `Promise`). The factory receives typed dependencies and must always return a component object (or a Promise resolving to one).

## Additional Component Registration Parameters
In the `asClass()`, `asFunction()`, and `asFactory()` functions, you can pass additional parameters.

*   `LIFETIME_DYNAMIC` or `LIFETIME_SINGLETON` to define the control method for creating the component.
*   You can also pass an array of dependency keys (strings), which will be used instead of those defined through the static `_deps` field in the component itself.

The order of these arguments does not matter.

Example:
```typescript
// Assuming ComponentClass and randomFactory are defined TS classes/functions
// And AppDependencies defines 'config', 'log', 'component'
container.register({
    'component': asClass<ISomeComponent>(ComponentClass, ['config', 'log'], LIFETIME_SINGLETON),
    'randomObject': asFactory<any>(randomFactory, LIFETIME_DYNAMIC, ['component']) // randomFactory can be async
});
```

## Defining Dependencies in Components
Each registered component can access another registered component through dependency injection. To do this, you need to explicitly define the dependencies through the static `_deps` field (array of strings). Then, the dependency will be available via the `deps` object (typed based on the container's generic type), which is passed by default to the component's constructor, or as the first parameter if the component is a function.

Example:
```typescript
// components/some-component.ts
import type { AppDependencies } from "../container"; // Import the dependency map type
import type { ISomeComponent, IConfig, ILogger } from "../interfaces"; // Import component/dependency interfaces

export default class ComponentClass implements ISomeComponent {
  // Dependency keys must match AppDependencies
  static _deps: Array<keyof AppDependencies> = [
    "config",
    "log"
  ];

  private config: IConfig;
  private log: ILogger;

  constructor(deps: AppDependencies) {
    // Access dependencies with type safety
    this.config = deps.config;
    this.log = deps.log;

    if (this.config.enable_logs) {
      this.log.log('Component created!');
    }
  }

  // Implement ISomeComponent methods...
}
```

If you need to use a function as a component, you should create a `_deps` field on the function object to define dependencies.

Example:
```typescript
// components/config-factory.ts
import type { AppDependencies } from "../container";
import type { IConfig, ILogger } from "../interfaces";
// Assuming loadConfigFile is an async function returning a Promise<Partial<IConfig>>
import { loadConfigFile } from "../utils/file-loader";

// Factory function signature matches asFactory requirement
const configFactory = async (deps: AppDependencies): Promise<IConfig> => {
  // Type safety for deps.log
  const log: ILogger = deps.log;
  const configFileData = await loadConfigFile('path/to/config.json'); // Example path
  log.log('Config loaded');
  return {
    host: 'localhost',
    port: 8080,
    enable_logs: false,
    ...configFileData // Spread loaded config
  };
};

// Define dependencies for the factory function
configFactory._deps: Array<keyof AppDependencies> = [
  'log'
];

export default configFactory;
```


## Injecting Dependencies Outside of Registered Components
Sometimes it's necessary to inject registered container components into an object or function that is not a container component and not registered within it. You can use the container's `build()` method for this. `build` is also generic for type safety.

```typescript
import { asClass } from '@sagifire/di-container';
import myContainer from './my-container'; // Assuming this exports your typed container instance
import type { AppDependencies } from './my-container'; // Import the dependency map type
import type { ILogger } from './interfaces';

class MyClass {
  // Define dependencies
  static _deps: Array<keyof AppDependencies> = ['log'];

  private log: ILogger;

  constructor(deps: Pick<AppDependencies, 'log'>) { // Only receive needed deps
    this.log = deps.log;
  }

  run(): void {
    this.log.log('Run MyClass');
  }
}

// Since build can handle async factories/dependencies, it returns a Promise
// Use the generic to specify the expected return type
async function initializeMyClass(): Promise<void> {
  const myObject = await myContainer.build<MyClass>(asClass(MyClass));
  myObject.run();
}

initializeMyClass();
```

## Inheritance in Components
Sometimes you need to implement a subclass of a particular class. In this case, you can split the definition of dependencies according to the logic of their use, leveraging TypeScript's inheritance.

```typescript
import type { AppDependencies } from "../container";
import type { ILogger, IConfig } from "../interfaces";

class BaseClass {
  static _deps: Array<keyof AppDependencies> = ['log'];
  protected log: ILogger; // Use protected for subclass access

  constructor(deps: Pick<AppDependencies, 'log'>) {
    this.log = deps.log;
    this.log.log('BaseClass constructed');
  }
}

class ChildClass extends BaseClass {
  // Inherit and add dependencies using keyof for safety
  static _deps: Array<keyof AppDependencies> = BaseClass._deps.concat([
    'config'
  ]);

  private config: IConfig;

  // Constructor receives all dependencies defined in _deps
  constructor(deps: Pick<AppDependencies, 'log' | 'config'>) {
    super(deps); // Call BaseClass constructor with relevant part of deps
    this.config = deps.config; // Access own dependency
    this.log.log('ChildClass constructed'); // Access inherited dependency via this.log
    if (this.config.some_setting) {
        // Use config dependency
    }
  }
}

// Register ChildClass in the container
// container.register({ 'child': asClass<ChildClass>(ChildClass) });
