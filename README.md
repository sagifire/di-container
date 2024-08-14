# @sagifire/di-container

This library implements a simple Inversion of Control (IoC) container with support for various object types and lifetimes.

## Strong Points:

1. **Flexible Configuration:**
    - The container supports different types of registrations: values, classes, functions and factories. This allows users to utilize the container in various scenarios.
    - The lifecycle configuration (`LIFETIME_DYNAMIC`, `LIFETIME_SINGLETON`) lets you control how often instances of objects are created.

2. **Dynamic Dependency Resolution:**
    - The code supports automatic dependency resolution through `dependencies`, reducing the amount of manual configuration needed.

3. **Clear Error Handling:**
    - Specialized errors (`ContainerConfigError`, `ContainerCyclicDependenceError`) are used to notify about configuration problems, improving problem diagnosis.

4. **Asynchronous Support:**
    - The container allows for asynchronous object creation, which is useful when working with promises or asynchronous factories.

5. **Obfuscation and Minification:**
    - The library works seamlessly even when code obfuscation and minification are applied.

## Weak Points:

1. The container does not support automatic dependency injection based on argument names. All dependencies must be explicitly registered.
2. There is no support for cyclic dependencies.
3. No support for isolated contexts.

### Minimalistic Approach:
- The container offers a limited set of features compared to Awilix, which can be both an advantage and a disadvantage depending on the project's needs.

## Overview

This library is used to implement centralized dependency injection management in application components.
The container consists of the `Container` class, along with helper functions `asValue()`, `asClass()`, `asFunction()`, and `asFactory()`.

## Creating a Container and Registering Components

To use the container, you first need to define it and register all the system components that will be injected as dependencies.

```javascript
import {
  Container, 
  asFunction, 
  asFactory, 
  asClass, 
  LIFETIME_SINGLETON 
} from "@sagifire/di-container";

import configFactory from "./components/config-factory.js";
import ComponentClass from "./components/some-component.js";

const container = new Container({  
  defaultLifetime: LIFETIME_SINGLETON  
});

container.register({
  'ENV': asValue('develop'),
  'log': asFunction((deps, ...args) => console.log(...args)),
  'config': asFactory(configFactory),
  'someComponent': asClass(ComponentClass)
});

export default container;
```

When registering a component, you can specify the creation mode: `LIFETIME_DYNAMIC` or `LIFETIME_SINGLETON`.

- `LIFETIME_DYNAMIC`: The container will recreate a new instance of the component each time it is injected. Not available for `asValue()`.
- `LIFETIME_SINGLETON`: The container will create only one instance of the component for the lifetime of the container and will always inject it. Always used with `asValue()`.

## Component Types

- ### Value - `asValue()`
  ```javascript
  { 'key': asValue(someValue) }
  ```
  Used for registering any value. Always uses `LIFETIME_SINGLETON`. Dependencies cannot be defined for this component type. 

- ### Class - `asClass()`
  ```javascript
  { 'key': asClass(someClass) }
  ```
  Used for registering classes that will later be injected as instances of this class.
   
- ### Function - `asFunction()`
  ```javascript
  { 'key': asFunction(someFunction) }
  ```
  Used for registering functions as components. The function can receive injected dependencies as the first argument, and other components can call it without worrying about its dependencies.

- ### Factory - `asFactory()`
  ```javascript
  { 'key': asFactory(someFactory) }
  ```
  Used for registering an object factory. A factory is a function that creates a component object and can be asynchronous. The factory can register its dependencies like a function but must always return a component object.

## Additional Component Registration Parameters
In the `asClass()`, `asFunction()`, and `asFactory()` functions, you can pass additional parameters.

- `LIFETIME_DYNAMIC` or `LIFETIME_SINGLETON` to define the control method for creating the component.
- You can also pass an array of dependencies, which will be used instead of those defined through the _deps field in the component itself.

The order of these arguments does not matter.

Example:
```javascript
{
    'component': asClass(componentClass, ['config', 'log'], LIFETIME_SINGLETON),
    'randomObject': asFactory(randomFactory, LIFETIME_DYNAMIC, ['component'])
}
```

## Defining Dependencies in Components
Each registered component can access another registered component through dependency injection. To do this, you need to explicitly define the dependencies through the static `_deps` field. Then, the dependency will be available via the `deps` object, which is passed by default to the component's constructor, or as the first parameter if the component is a function.

Example:
```javascript
export default class ComponentClass {
  static _deps = [
    "config",
    "log"
  ];

  constructor(deps) {
    this.deps = deps;
    if (this.deps.config.enable_logs) {
      this.deps.log('Component created!');
    }
  }
}
```

If you need to use a function as a component, you should create a `_deps` field on the function object to define dependencies.

Example:
```javascript
const configFactory = async (deps) => {
  const configFileData = await loadConfigFile(configFilename);
  deps.log('Config loaded');
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


## Injecting Dependencies Outside of Registered Components
Sometimes it's necessary to inject registered container components into an object or function that is not a container component and not registered within it. You can use the container's `build()` method for this.

```javascript
import { asClass } from '@sagifire/di-container';
import myContainer from './my-container.js';

class MyClass {
  static _deps = ['log'];

  constructor(deps) {
    this.deps = deps;
  }

  run() {
    this.deps.log('Run MyClass');
  }
}

const myObject = await myContainer.build(asClass(MyClass));
myObject.run();
```

## Inheritance in Components
Sometimes you need to implement a subclass of a particular class. In this case, you can split the definition of dependencies according to the logic of their use.

```javascript
class BaseClass {
  static _deps = ['log'];

  constructor(deps) {
    this.deps = deps;
  }
}

class ChildClass extends BaseClass {
  static _deps = BaseClass._deps.concat([
    'config'
  ]);

  constructor(deps) {
    super(deps);
  }
}
```