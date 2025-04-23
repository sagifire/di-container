export declare const LIFETIME_DYNAMIC: 0;
export declare const LIFETIME_SINGLETON: 1;
export type Lifetime = typeof LIFETIME_DYNAMIC | typeof LIFETIME_SINGLETON;
export declare const TYPE_VALUE: 0;
export declare const TYPE_FUNCTION: 1;
export declare const TYPE_CLASS: 2;
export declare const TYPE_FACTORY: 3;
export type RegistrationType = typeof TYPE_VALUE | typeof TYPE_FUNCTION | typeof TYPE_CLASS | typeof TYPE_FACTORY;
export type DependencyId = string;
export type Dependencies = DependencyId[];
export type ResolvedDependencies = Record<DependencyId, any>;
export type ClassConstructor<T = any> = new (...args: any[]) => T;
export type FactoryFunction<T = any, S extends TypeSchema = {}> = (deps: ResolvedDependencies, container: Container<S> | undefined, config: RegistrationConfig | undefined) => T | Promise<T>;
export type DependencyFunction<T = any> = (deps: ResolvedDependencies, ...args: any[]) => T;
export interface RegistrationConfig {
    value: any;
    type: RegistrationType;
    lifetime?: Lifetime;
    dependencies?: Dependencies;
    _deps?: Dependencies;
}
export interface ContainerConfig {
    defaultLifetime?: Lifetime;
}
export type TypeSchema = Record<DependencyId, any>;
export declare class ContainerError extends Error {
    constructor(message: string);
}
export declare class ContainerConfigError extends ContainerError {
    constructor(message: string);
}
export declare class ContainerCyclicDependenceError extends ContainerError {
    constructor(message: string);
}
export declare class Container<Schema extends TypeSchema = {}> {
    static configDefaults: Required<ContainerConfig>;
    private readonly config;
    private readonly registrations;
    private readonly singletons;
    private readonly depsInResolving;
    constructor(config?: ContainerConfig);
    /**
     * Перевіряє, чи існує реєстрація з вказаним ID.
     * @param id - Ідентифікатор залежності.
     * @returns true, якщо реєстрація існує, інакше false.
     */
    hasRegistration(id: DependencyId): boolean;
    /**
     * Реєструє залежність або набір залежностей.
     * @param id - Ідентифікатор залежності або об'єкт з реєстраціями.
     * @param config - Конфігурація реєстрації (якщо id - рядок).
     */
    register(id: DependencyId | Record<DependencyId, RegistrationConfig>, config?: RegistrationConfig | null): void;
    /**
     * Отримує екземпляр залежності за її ID.
     * @param id - Ідентифікатор залежності.
     * @returns Проміс, який розв'язується екземпляром залежності.
     * @template T - Явно вказаний тип залежності (перевизначає тип зі схеми).
     * @template K - Тип ідентифікатора залежності, обмежений ключами схеми або DependencyId.
     */
    get<T = any, // Тип для явного зазначення
    K extends DependencyId = DependencyId>(id: K): Promise<T extends unknown ? (K extends keyof Schema ? Schema[K] : unknown) : T>;
    /**
     * Внутрішній метод для побудови екземпляра залежності на основі конфігурації.
     * @param config - Конфігурація реєстрації.
     * @returns Проміс, який розв'язується екземпляром залежності.
     * @template T - Очікуваний тип залежності.
     */
    private build;
    /**
     * Будує екземпляр класу з розв'язаними залежностями.
     * @param classConstructor - Конструктор класу.
     * @param dependencies - Список ID залежностей.
     * @returns Проміс, який розв'язується екземпляром класу.
     * @template T - Тип класу.
     */
    private buildClass;
    /**
     * Викликає фабричну функцію з розв'язаними залежностями.
     * @param factory - Фабрична функція.
     * @param config - Повна конфігурація реєстрації.
     * @returns Проміс, який розв'язується значенням, повернутим фабрикою.
     * @template T - Очікуваний тип значення.
     */
    private buildFactory;
    /**
     * Розв'язує список залежностей, отримуючи їх екземпляри з контейнера.
     * @param dependencies - Масив ID залежностей.
     * @returns Проміс, який розв'язується об'єктом з розв'язаними залежностями.
     */
    private resolveDependencies;
}
/**
 * Створює конфігурацію для реєстрації значення.
 * @param value - Значення для реєстрації.
 * @returns Об'єкт конфігурації RegistrationConfig.
 */
export declare const asValue: (value: any) => RegistrationConfig;
/**
 * Створює конфігурацію для реєстрації класу.
 * @param classValue - Конструктор класу.
 * @param args - Додаткові параметри: lifetime та/або масив dependencies.
 * @returns Об'єкт конфігурації RegistrationConfig.
 */
export declare const asClass: (classValue: ClassConstructor, ...args: (Lifetime | Dependencies)[]) => RegistrationConfig;
/**
 * Створює конфігурацію для реєстрації функції.
 * Функція буде викликана з розв'язаними залежностями як перший аргумент.
 * @param functionValue - Функція для реєстрації.
 * @param args - Додаткові параметри: lifetime та/або масив dependencies.
 * @returns Об'єкт конфігурації RegistrationConfig.
 */
export declare const asFunction: (functionValue: DependencyFunction, ...args: (Lifetime | Dependencies)[]) => RegistrationConfig;
/**
 * Створює конфігурацію для реєстрації фабричної функції.
 * Фабрика отримує залежності, контейнер та конфігурацію як аргументи.
 * @param factoryValue - Фабрична функція.
 * @param args - Додаткові параметри: lifetime та/або масив dependencies.
 * @returns Об'єкт конфігурації RegistrationConfig.
 */
export declare const asFactory: (factoryValue: FactoryFunction<any, any>, ...args: (Lifetime | Dependencies)[]) => RegistrationConfig;
