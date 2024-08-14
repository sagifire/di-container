// types.d.ts

export const LIFETIME_DYNAMIC: 0;
export const LIFETIME_SINGLETON: 1;

export const TYPE_VALUE: 0;
export const TYPE_FUNCTION: 1;
export const TYPE_CLASS: 2;
export const TYPE_FACTORY: 3;

export class ContainerError extends Error {
    constructor(message: string);
}

export class ContainerConfigError extends ContainerError {
    constructor(message: string);
}

export class ContainerCyclicDependenceError extends ContainerError {
    constructor(message: string);
}

export type Lifetime = typeof LIFETIME_DYNAMIC | typeof LIFETIME_SINGLETON;
export type RegistrationType = typeof TYPE_VALUE | typeof TYPE_FUNCTION | typeof TYPE_CLASS | typeof TYPE_FACTORY;

export interface ContainerConfig {
    defaultLifetime?: Lifetime;
}

export interface RegistrationConfig {
    value: any;
    type: RegistrationType;
    lifetime?: Lifetime;
    dependencies?: string[];
}

export class Container {
    static configDefaults: ContainerConfig;

    config: ContainerConfig;
    registrations: { [id: string]: RegistrationConfig };
    singletons: { [id: string]: any };
    private depsInResolving: Set<string>;

    constructor(config?: ContainerConfig);

    hasRegistration(id: string): boolean;

    register(id: string, config: RegistrationConfig): void;
    register(configObject: { [id: string]: RegistrationConfig }): void;

    get<T = any>(id: string): Promise<T>;

    build(config: RegistrationConfig): Promise<any>;

    private buildClass<T>(classFunction: new (...args: any[]) => T, dependencies: string[]): Promise<T>;

    private buildFunction(func: (...args: any[]) => any, dependencies: string[]): Promise<(...args: any[]) => any>;

    private buildFactory(factory: (...args: any[]) => any, config: RegistrationConfig): Promise<any>;

    private resolveDependencies(dependencies: string[]): Promise<{ [depId: string]: any }>;
}

export function asValue(value: any): RegistrationConfig;

export function asClass<T>(classValue: new (...args: any[]) => T, dependencies?: string[], lifetime?: Lifetime): RegistrationConfig;

export function asFunction<T extends (...args: any[]) => any>(functionValue: T, dependencies?: string[], lifetime?: Lifetime): RegistrationConfig;

export function asFactory(factoryValue: (...args: any[]) => any, dependencies?: string[], lifetime?: Lifetime): RegistrationConfig;
