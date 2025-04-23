import { describe, it, expect } from 'vitest';
import {
    Container,
    ContainerConfigError,
    ContainerCyclicDependenceError,
    asValue,
    asClass,
    asFunction,
    asFactory,
    LIFETIME_DYNAMIC,
    LIFETIME_SINGLETON,
    TYPE_VALUE
} from '../dist/es/index.js';

describe('Container', () => {

    it('should register and resolve a simple value', async () => {
        const container = new Container();
        container.register('config', asValue('someConfig'));

        const result = await container.get('config');
        expect(result).toBe('someConfig');
    });

    it('should register and resolve a class instance', async () => {
        class MyClass {
            constructor() {
                this.name = 'MyClassInstance';
            }
        }

        const container = new Container();
        container.register('myClass', asClass(MyClass));

        const instance = await container.get('myClass');
        expect(instance).toBeInstanceOf(MyClass);
        expect(instance.name).toBe('MyClassInstance');
    });

    it('should resolve dependencies for a class', async () => {
        class Dependency {
            constructor() {
                this.value = 'dependency';
            }
        }

        class MyClass {
            constructor({ dep }) {
                this.dep = dep;
            }
        }

        const container = new Container();
        container.register('dep', asClass(Dependency));
        container.register('myClass', asClass(MyClass, ['dep']));

        const instance = await container.get('myClass');
        expect(instance.dep).toBeInstanceOf(Dependency);
        expect(instance.dep.value).toBe('dependency');
    });

    it('should register and resolve a function', async () => {
        const myFunction = ({ config }) => {
            return `Value: ${config}`;
        };

        const container = new Container();
        container.register('config', asValue('myConfig'));
        container.register('myFunction', asFunction(myFunction, ['config']));

        const func = await container.get('myFunction');
        expect(func()).toBe('Value: myConfig');
    });

    it('should register and resolve a factory', async () => {
        const myFactory = ({ dep }) => {
            return dep + ' from factory';
        };

        const container = new Container();
        container.register('dep', asValue('dependency'));
        container.register('myFactory', asFactory(myFactory, ['dep']));

        const result = await container.get('myFactory');
        expect(result).toBe('dependency from factory');
    });

    it('should throw an error for undefined registration value', () => {
        const container = new Container();
        expect(() => {
            container.register('invalid', { type: TYPE_VALUE });
        }).toThrow(ContainerConfigError);
    });

    it('should allow singleton and dynamic lifetimes', async () => {
        class MyClass {
            constructor() {
                this.timestamp = Date.now();
            }
        }

        const container = new Container();

        // Singleton instance
        container.register('singletonClass', asClass(MyClass, [], LIFETIME_SINGLETON));
        const singletonInstance1 = await container.get('singletonClass');
        await new Promise(r => setTimeout(r, 10)); // Reduced timeout for faster tests
        const singletonInstance2 = await container.get('singletonClass');
        expect(singletonInstance1.timestamp).toBe(singletonInstance2.timestamp);

        // Dynamic instance
        container.register('dynamicClass', asClass(MyClass, [], LIFETIME_DYNAMIC));
        const dynamicInstance1 = await container.get('dynamicClass');
        await new Promise(r => setTimeout(r, 10)); // Reduced timeout for faster tests
        const dynamicInstance2 = await container.get('dynamicClass');
        expect(dynamicInstance1.timestamp).not.toBe(dynamicInstance2.timestamp);
    });

    it('should allow manual build of a class', async () => {
        class MyClass {
            constructor({ dep }) {
                this.dep = dep;
            }
        }

        const container = new Container();
        container.register('dep', asValue('dependency'));

        const config = asClass(MyClass, ['dep']);
        const instance = await container.build(config);

        expect(instance.dep).toBe('dependency');
    });

    it('should resolve nested dependencies', async () => {
        class Dependency1 {
            constructor() {
                this.name = 'Dependency1';
            }
        }

        class Dependency2 {
            constructor({ dep1 }) {
                this.dep1 = dep1;
            }
        }

        class MyClass {
            constructor({ dep2 }) {
                this.dep2 = dep2;
            }
        }

        const container = new Container();
        container.register('dep1', asClass(Dependency1));
        container.register('dep2', asClass(Dependency2, ['dep1']));
        container.register('myClass', asClass(MyClass, ['dep2']));

        const instance = await container.get('myClass');
        expect(instance.dep2.dep1.name).toBe('Dependency1');
    });

    it('should throw error for invalid type in registration', () => {
        const container = new Container();
        expect(() => {
            container.register('invalid', { value: 'test', type: 99 });
        }).toThrow(ContainerConfigError);
    });

    it('should throw error for cycle dependency', async () => { // Make async for rejects
        class Dependency1 {
            constructor() {
                this.name = 'Dependency1';
            }
        }

        class Dependency2 {
            constructor({ dep1 }) {
                this.dep1 = dep1;
            }
        }

        class MyClass {
            constructor({ dep2 }) {
                this.dep2 = dep2;
            }
        }

        const container = new Container();
        container.register('dep1', asClass(Dependency1, ['dep2']));
        container.register('dep2', asClass(Dependency2, ['dep1']));
        container.register('myClass', asClass(MyClass, ['dep2']));

        await expect(container.get('myClass')).rejects.toThrow(ContainerCyclicDependenceError);
    });

});
