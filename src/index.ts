// Типи для життєвого циклу залежностей
export const LIFETIME_DYNAMIC = 0 as const; // Використовуємо 'as const' для створення літеральних типів
export const LIFETIME_SINGLETON = 1 as const;
export type Lifetime = typeof LIFETIME_DYNAMIC | typeof LIFETIME_SINGLETON;

// Типи для реєстрацій
export const TYPE_VALUE = 0 as const;
export const TYPE_FUNCTION = 1 as const;
export const TYPE_CLASS = 2 as const;
export const TYPE_FACTORY = 3 as const;
export type RegistrationType = typeof TYPE_VALUE | typeof TYPE_FUNCTION | typeof TYPE_CLASS | typeof TYPE_FACTORY;

// Інші типи
export type DependencyId = string;
export type Dependencies = DependencyId[];
export type ResolvedDependencies = Record<DependencyId, any>; // Можна уточнити тип залежностей, якщо відомо
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassConstructor<T = any> = new (...args: any[]) => T; // Тип для конструктора класу
// Оновлюємо FactoryFunction, щоб приймати дженерік Container
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FactoryFunction<T = any, S extends TypeSchema = {}> = (deps: ResolvedDependencies, container: Container<S> | undefined, config: RegistrationConfig | undefined) => T | Promise<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DependencyFunction<T = any> = (deps: ResolvedDependencies, ...args: any[]) => T;

export type FunctionWithDeps = (...args: any[]) => any | Promise<any>; // Функція, яка приймає аргументи і повертає значення

// Інтерфейс для конфігурації реєстрації
export interface RegistrationConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any; // Значення (клас, функція, фабрика, значення)
    type: RegistrationType; // Тип реєстрації
    lifetime?: Lifetime; // Життєвий цикл (опціонально, є дефолтний)
    dependencies?: Dependencies; // Список ID залежностей (опціонально)
    _deps?: Dependencies; // Застаріле поле, не використовується в TS версії
}

// Інтерфейс для конфігурації контейнера
export interface ContainerConfig {
    defaultLifetime?: Lifetime;
}

// Тип для мапи реєстрацій
type RegistrationsMap = Record<DependencyId, RegistrationConfig>;
// Тип для мапи синглтонів
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SingletonsMap = Record<DependencyId, any>; // Зберігаємо вже створені синглтони

// Тип для схеми типів контейнера
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypeSchema = Record<DependencyId, any>;

export class ContainerError extends Error {
    constructor(message: string) { // Додаємо тип для message
        super(message);
        this.name = "ContainerError";
    }
}

export class ContainerConfigError extends ContainerError {
    constructor(message: string) { // Додаємо тип для message
        super(message);
        this.name = "ContainerConfigError";
    }
}

export class ContainerCyclicDependenceError extends ContainerError {
    constructor(message: string) { // Додаємо тип для message
        super(message);
        this.name = "ContainerCyclicDependenceError";
    }
}

// Робимо клас Container дженериком, що приймає схему типів Schema
// За замовчуванням Schema - це пустий об'єкт
export class Container<Schema extends TypeSchema = {}> {
    // Статичні налаштування за замовчуванням
    static configDefaults: Required<ContainerConfig> = { // Використовуємо Required для гарантії наявності всіх полів
        defaultLifetime: LIFETIME_SINGLETON
    };

    // Властивості класу з типами
    private readonly config: Required<ContainerConfig>; // Конфігурація контейнера (робимо її Required)
    private readonly registrations: RegistrationsMap; // Мапа реєстрацій
    private readonly singletons: SingletonsMap; // Кеш синглтонів
    private readonly depsInResolving: Set<DependencyId>; // Множина для відстеження циклічних залежностей

    constructor(config?: ContainerConfig) { // Параметр config опціональний
        // Ініціалізуємо конфігурацію, використовуючи значення за замовчуванням
        this.config = { ...Container.configDefaults, ...config };

        // Ініціалізуємо інші властивості
        this.registrations = {};
        this.singletons = {};
        this.depsInResolving = new Set<DependencyId>();
    }

    /**
     * Перевіряє, чи існує реєстрація з вказаним ID.
     * @param id - Ідентифікатор залежності.
     * @returns true, якщо реєстрація існує, інакше false.
     */
    hasRegistration(id: DependencyId): boolean { // Додаємо тип для id та повертаного значення
        // Використовуємо Object.prototype.hasOwnProperty.call для безпеки
        return Object.prototype.hasOwnProperty.call(this.registrations, id);
    }

    /**
     * Реєструє залежність або набір залежностей.
     * @param id - Ідентифікатор залежності або об'єкт з реєстраціями.
     * @param config - Конфігурація реєстрації (якщо id - рядок).
     */
    register(id: DependencyId | Record<DependencyId, RegistrationConfig>, config: RegistrationConfig | null = null): void { // Додаємо типи
        // Реєстрація об'єкта з кількома залежностями
        if (typeof id === 'object' && !Array.isArray(id) && id !== null) {
            for (const key in id) {
                // Використовуємо Object.prototype.hasOwnProperty.call
                if (Object.prototype.hasOwnProperty.call(id, key)) {
                    // Переконуємося, що значення є конфігурацією
                    const registrationConf = id[key];
                    if (typeof registrationConf !== 'object' || registrationConf === null || typeof registrationConf.type === 'undefined' || typeof registrationConf.value === 'undefined') {
                         throw new ContainerConfigError(`Invalid configuration provided for key "${key}" during bulk registration.`);
                    }
                    this.register(key, registrationConf); // Рекурсивний виклик для кожного ключа
                }
            }
        // Реєстрація однієї залежності за ID (рядком)
        } else if (typeof id === 'string') {
            // Перевіряємо, чи передано конфігурацію
            if (!config) {
                throw new ContainerConfigError(`Configuration is required when registering with string ID: ${id}`);
            }

            // Створюємо копію конфігурації, щоб не мутувати оригінал
            const registrationConfig: RegistrationConfig = { ...config };

            // Валідація конфігурації
            if (typeof registrationConfig.value === 'undefined') { // Перевіряємо наявність value
                throw new ContainerConfigError('Registration value is undefined');
            }

            if (typeof registrationConfig.type === 'undefined') { // Перевіряємо наявність type
                throw new ContainerConfigError('Registration type is undefined');
            }

            // Перевіряємо валідність типу реєстрації
            const validTypes: RegistrationType[] = [TYPE_VALUE, TYPE_CLASS, TYPE_FACTORY, TYPE_FUNCTION];
            if (!validTypes.includes(registrationConfig.type)) {
                throw new ContainerConfigError('Registration type is invalid');
            }

            // Встановлюємо lifetime за замовчуванням, якщо не вказано
            if (typeof registrationConfig.lifetime === 'undefined') {
                registrationConfig.lifetime = this.config.defaultLifetime;
            }

            // Перевіряємо валідність lifetime
            const validLifetimes: Lifetime[] = [LIFETIME_SINGLETON, LIFETIME_DYNAMIC];
            if (!validLifetimes.includes(registrationConfig.lifetime)) {
                throw new ContainerConfigError('Registration lifetime is invalid');
            }

            // Додаткові перевірки для типів CLASS, FACTORY, FUNCTION
            const needsFunctionValueTypes: RegistrationType[] = [TYPE_CLASS, TYPE_FACTORY, TYPE_FUNCTION];
            if (needsFunctionValueTypes.includes(registrationConfig.type)) {
                if (typeof registrationConfig.value !== 'function') {
                    throw new ContainerConfigError('Registration value must be a function for CLASS, FACTORY, or FUNCTION types');
                }

                // Обробка залежностей: використовуємо config.dependencies, якщо є, інакше []
                if (typeof registrationConfig.dependencies === 'undefined') {
                    registrationConfig.dependencies = [];
                } else if (!Array.isArray(registrationConfig.dependencies)) {
                     throw new ContainerConfigError('Registration dependencies must be an array');
                } else if (!registrationConfig.dependencies.every(dep => typeof dep === 'string')) {
                     // Перевіряємо, чи dependencies є масивом рядків
                     throw new ContainerConfigError('Registration dependencies must be an array of strings');
                }
                // Видаляємо застаріле поле _deps, якщо воно є
                delete registrationConfig._deps;
            }

            // Для TYPE_VALUE завжди встановлюємо LIFETIME_DYNAMIC
            if (registrationConfig.type === TYPE_VALUE) {
                registrationConfig.lifetime = LIFETIME_DYNAMIC;
            }

            // Зберігаємо конфігурацію реєстрації
            // Переконуємося, що всі необхідні поля є перед збереженням
            this.registrations[id] = registrationConfig as Required<RegistrationConfig>;

            // Видаляємо існуючий синглтон, якщо реєстрація оновлюється
            if (Object.prototype.hasOwnProperty.call(this.singletons, id)) {
                delete this.singletons[id];
            }
        } else {
            // Непідтримуваний тип ID
            throw new ContainerConfigError('Invalid register id type. Must be a string or an object.');
        }
    }

    /**
     * Отримує екземпляр залежності за її ID.
     * @param id - Ідентифікатор залежності.
     * @returns Проміс, який розв'язується екземпляром залежності.
     * @template T - Явно вказаний тип залежності (перевизначає тип зі схеми).
     * @template K - Тип ідентифікатора залежності, обмежений ключами схеми або DependencyId.
     */
    // Оновлюємо сигнатуру методу get
    async get<
        T = any, // Тип для явного зазначення
        K extends DependencyId = DependencyId // Тип ID, може бути ключем зі Schema
    >(id: K): Promise<
        // Використовуємо умовний тип для визначення типу повернення:
        // Якщо T не є 'any' (тобто тип вказано явно), повертаємо T.
        // Інакше, перевіряємо, чи є K ключем у Schema.
        // Якщо так, повертаємо тип Schema[K].
        // Якщо ні, повертаємо 'any'.
        // Використовуємо `unknown` замість `any` для кращої типізації за замовчуванням
        T extends unknown ? (K extends keyof Schema ? Schema[K] : unknown) : T
    > {
        // Перевіряємо наявність реєстрації
        if (!this.hasRegistration(id)) {
            throw new ContainerConfigError(`No registration found for id: ${id}`);
        }

        // Перевіряємо на циклічні залежності
        if (this.depsInResolving.has(id)) {
            throw new ContainerCyclicDependenceError(`Dependency cycle detected for id: ${id}`);
        }

        // Отримуємо конфігурацію реєстрації
        // Ми впевнені, що вона існує завдяки hasRegistration
        const registration = this.registrations[id]!; // Використовуємо non-null assertion

        // Визначаємо тип результату заздалегідь, використовуючи той самий умовний тип
        type ResultType = T extends unknown ? (K extends keyof Schema ? Schema[K] : unknown) : T;
        let result: ResultType;

        // Додаємо ID до множини відстеження
        this.depsInResolving.add(id);
        try {
            // Обробка синглтонів
            if (registration.lifetime === LIFETIME_SINGLETON) {
                if (!Object.prototype.hasOwnProperty.call(this.singletons, id)) {
                    // Створюємо синглтон, якщо його ще немає
                    // Приводимо тип результату build до ResultType
                    this.singletons[id] = await this.build<ResultType>(registration);
                }
                // Приводимо тип синглтона до ResultType
                result = this.singletons[id] as ResultType;
            } else {
                // Створюємо новий екземпляр для динамічного життєвого циклу
                // Приводимо тип результату build до ResultType
                result = await this.build<ResultType>(registration);
            }
        } finally {
            // Видаляємо ID з множини відстеження після завершення (успішного чи ні)
            this.depsInResolving.delete(id);
        }
        return result;
    }

    /**
     * Внутрішній метод для побудови екземпляра залежності на основі конфігурації.
     * @param config - Конфігурація реєстрації.
     * @returns Проміс, який розв'язується екземпляром залежності.
     * @template T - Очікуваний тип залежності.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async build<T = any>(config: RegistrationConfig): Promise<T> { // Додаємо тип для config, повертаного значення та Generic T
        // Визначаємо залежності для побудови
        const dependencies = config.dependencies || []; // Використовуємо пустий масив, якщо залежності не вказані

        // Будуємо екземпляр відповідно до типу реєстрації
        switch (config.type) {
            case TYPE_CLASS:
                // Переконуємося, що value є конструктором
                if (typeof config.value !== 'function' || !config.value.prototype) {
                     throw new ContainerConfigError(`Value for CLASS registration must be a class constructor.`);
                }
                return await this.buildClass<T>(config.value as ClassConstructor<T>, dependencies);
            case TYPE_FUNCTION:
                 // Переконуємося, що value є функцією
                if (typeof config.value !== 'function') {
                     throw new ContainerConfigError(`Value for FUNCTION registration must be a function.`);
                }
                // Повертаємо функцію, яка викликає оригінальну функцію з розв'язаними залежностями
                const func = config.value as DependencyFunction<T>;
                const resolvedFuncDeps = await this.resolveDependencies(dependencies);
                // Повертаємо обгортку, яка передає залежності першим аргументом
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return ((...args: any[]) => func(resolvedFuncDeps, ...args)) as T; // Приведення типу може бути не зовсім точним тут
            case TYPE_FACTORY:
                 // Переконуємося, що value є функцією
                if (typeof config.value !== 'function') {
                 throw new ContainerConfigError(`Value for FACTORY registration must be a function.`);
                }
                // Передаємо тип Schema до buildFactory
                return await this.buildFactory<T>(config.value as FactoryFunction<T, Schema>, config);
            case TYPE_VALUE:
                // Просто повертаємо значення
                return config.value as T;
            default:
                 // Додаємо перевірку для вичерпності, щоб TypeScript допоміг виявити пропущені випадки
                const exhaustiveCheck: never = config.type;
                throw new ContainerConfigError(`Unhandled registration type: ${exhaustiveCheck}`);
        }
    }

    /**
     * Будує екземпляр класу з розв'язаними залежностями.
     * @param classConstructor - Конструктор класу.
     * @param dependencies - Список ID залежностей.
     * @returns Проміс, який розв'язується екземпляром класу.
     * @template T - Тип класу.
     */
    private async buildClass<T>(classConstructor: ClassConstructor<T>, dependencies: Dependencies): Promise<T> { // Додаємо типи
        const resolvedDeps = await this.resolveDependencies(dependencies);
        // Передаємо розв'язані залежності як один об'єкт у конструктор
        // Припускаємо, що конструктор приймає один аргумент - об'єкт залежностей
        // Якщо конструктор приймає залежності як окремі аргументи, логіка буде іншою
        // TODO: Розглянути можливість передачі залежностей як окремих аргументів, якщо це потрібно
        return new classConstructor(resolvedDeps);
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
    private async buildFactory<T>(factory: FactoryFunction<T, Schema>, config: RegistrationConfig): Promise<T> {
        const resolvedDeps = await this.resolveDependencies(config.dependencies || []);
        // Викликаємо фабрику, передаючи залежності, контейнер (this) та конфігурацію
        let value = factory(resolvedDeps, this, config);
        // Обробляємо випадок, коли фабрика повертає проміс
        if (typeof value === 'object' && value !== null && value instanceof Promise) {
            value = await value;
        }
        return value;
    }

    /**
     * Розв'язує список залежностей, отримуючи їх екземпляри з контейнера.
     * @param dependencies - Масив ID залежностей.
     * @returns Проміс, який розв'язується об'єктом з розв'язаними залежностями.
     */
    private async resolveDependencies(dependencies: Dependencies): Promise<ResolvedDependencies> { // Додаємо типи
        const resolvedDeps: ResolvedDependencies = {};
        // Асинхронно отримуємо кожну залежність
        // Використовуємо Promise.all для паралельного завантаження
        const promises = dependencies.map(depId => this.get(depId));
        const resolvedValues = await Promise.all(promises);

        dependencies.forEach((depId, index) => {
            resolvedDeps[depId] = resolvedValues[index];
        });

        return resolvedDeps;
    }
}

// --- Допоміжні функції для створення конфігурацій ---

// Інтерфейс для результату resolveConfigArguments
interface ResolvedConfigArgs {
    lifetime?: Lifetime;
    dependencies?: Dependencies;
}

/**
 * Розбирає додаткові аргументи для asClass, asFunction, asFactory.
 * @param args - Масив аргументів (lifetime або масив dependencies).
 * @returns Об'єкт з розібраними lifetime та dependencies.
 */
const resolveConfigArguments = (args: (Lifetime | Dependencies)[]): ResolvedConfigArgs => { // Додаємо типи
    const result: ResolvedConfigArgs = {};
    for (const argument of args) {
        if (typeof argument === 'number') { // Це lifetime
            if (typeof result.lifetime !== 'undefined') {
                throw new ContainerConfigError('Seems to duplicate lifetime in arguments');
            }
            // Перевіряємо, чи це валідний Lifetime
            const validLifetimes: Lifetime[] = [LIFETIME_DYNAMIC, LIFETIME_SINGLETON];
            if (!validLifetimes.includes(argument)) {
                 throw new ContainerConfigError('Invalid lifetime value provided in arguments');
            }
            result.lifetime = argument;
        } else if (Array.isArray(argument)) { // Це dependencies
            if (typeof result.dependencies !== 'undefined') {
                throw new ContainerConfigError('Seems to duplicate dependencies list in arguments');
            }
             // Перевіряємо, чи всі елементи масиву є рядками
            if (!argument.every(dep => typeof dep === 'string')) {
                throw new ContainerConfigError('Dependencies list must contain only strings');
            }
            result.dependencies = argument as Dependencies; // Приводимо тип
        } else {
            // Непідтримуваний тип аргументу
            throw new ContainerConfigError(`Can't resolve config argument type: ${typeof argument}`);
        }
    }
    return result;
};

/**
 * Створює конфігурацію для реєстрації значення.
 * @param value - Значення для реєстрації.
 * @returns Об'єкт конфігурації RegistrationConfig.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const asValue = (value: any): RegistrationConfig => { // Додаємо тип для value та повертаного значення
    return {
        value: value,
        type: TYPE_VALUE,
        // lifetime автоматично встановлюється в DYNAMIC в методі register
    };
};

/**
 * Створює конфігурацію для реєстрації класу.
 * @param classValue - Конструктор класу.
 * @param args - Додаткові параметри: lifetime та/або масив dependencies.
 * @returns Об'єкт конфігурації RegistrationConfig.
 */
export const asClass = (classValue: ClassConstructor, ...args: (Lifetime | Dependencies)[]): RegistrationConfig => { // Додаємо типи
    return {
        value: classValue,
        type: TYPE_CLASS,
        ...resolveConfigArguments(args) // Розбираємо додаткові аргументи
    };
};

/**
 * Створює конфігурацію для реєстрації функції.
 * Функція буде викликана з розв'язаними залежностями як перший аргумент.
 * @param functionValue - Функція для реєстрації.
 * @param args - Додаткові параметри: lifetime та/або масив dependencies.
 * @returns Об'єкт конфігурації RegistrationConfig.
 */
export const asFunction = (functionValue: FunctionWithDeps, ...args: (Lifetime | Dependencies)[]): RegistrationConfig => { // Додаємо типи
    return {
        value: functionValue,
        type: TYPE_FUNCTION,
        ...resolveConfigArguments(args) // Розбираємо додаткові аргументи
    };
};

/**
 * Створює конфігурацію для реєстрації фабричної функції.
 * Фабрика отримує залежності, контейнер та конфігурацію як аргументи.
 * @param factoryValue - Фабрична функція.
 * @param args - Додаткові параметри: lifetime та/або масив dependencies.
 * @returns Об'єкт конфігурації RegistrationConfig.
 */
export const asFactory = (factoryValue: FunctionWithDeps, ...args: (Lifetime | Dependencies)[]): RegistrationConfig => {
    return {
        value: factoryValue,
        type: TYPE_FACTORY,
        ...resolveConfigArguments(args) // Розбираємо додаткові аргументи
    };
};
