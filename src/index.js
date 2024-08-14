export const LIFETIME_DYNAMIC = 0
export const LIFETIME_SINGLETON = 1

export const TYPE_VALUE = 0
export const TYPE_FUNCTION = 1
export const TYPE_CLASS = 2
export const TYPE_FACTORY = 3

export class ContainerError extends Error {
    constructor(message) {
        super(message)
        this.name = "ContainerError"
    }
}

export class ContainerConfigError extends ContainerError {
    constructor(message) {
        super(message)
        this.name = "ContainerConfigError"
    }
}

export class ContainerCyclicDependenceError extends ContainerError {
    constructor(message) {
        super(message)
        this.name = "ContainerCyclicDependenceError"
    }
}

export class Container {

    static configDefaults = {
        defaultLifetime: LIFETIME_SINGLETON
    }

    constructor(config) {
        this.config = config || {}

        for (const configKey in Container.configDefaults) {
            if (Container.configDefaults.hasOwnProperty(configKey) && 'undefined' === typeof this.config[configKey]) {
                this.config[configKey] = Container.configDefaults[configKey]
            }
        }

        this.registrations = {}
        this.singletons = {}
        this.depsInResolving = new Set()
    }

    hasRegistration(id) {
        return this.registrations.hasOwnProperty(id)
    }

    register(id, config = null) {
        if ('object' === (typeof id) && !Array.isArray(id) && null !== id) {
            for (const key in id) {
                if (id.hasOwnProperty(key)) {
                    this.register(key, id[key])
                }
            }
        } else if ('string' === typeof id ) {

            if ('undefined' === typeof config.value) {
                throw new ContainerConfigError('Registration value is undefined')
            }

            if ('undefined' === typeof config.type) {
                throw new ContainerConfigError('Registration type is undefined')
            }

            if (![TYPE_VALUE, TYPE_CLASS, TYPE_FACTORY, TYPE_FUNCTION].includes(config.type)) {
                throw new ContainerConfigError('Registration type is invalid')
            }

            if ('undefined' === typeof config.lifetime) {
                config.lifetime = this.config.defaultLifetime
            }

            if (![LIFETIME_SINGLETON, LIFETIME_DYNAMIC].includes(config.lifetime)) {
                throw new ContainerConfigError('Registration lifetime is invalid')
            }

            if ([TYPE_CLASS, TYPE_FACTORY, TYPE_FUNCTION].includes(config.type)) {
                if ('function' !== typeof config.value) {
                    throw new ContainerConfigError('Registration value must be a function')
                }

                if ('undefined' === typeof config.dependencies) {
                    if ('undefined' !== typeof config.value._deps) {
                        if (!Array.isArray(config.value._deps)) {
                            throw new ContainerConfigError('Registration value has invalid _deps')
                        }
                        config.dependencies = config.value._deps
                    } else {
                        config.dependencies = []
                    }
                } else {
                    if (!Array.isArray(config.dependencies)) {
                        throw new ContainerConfigError('Registration dependencies in config has invalid type')
                    }
                }
            }

            if (TYPE_VALUE === config.type) {
                config.lifetime = LIFETIME_DYNAMIC
            }

            this.registrations[id] = config

            if ('undefined' !== typeof this.singletons[id]) {
                delete this.singletons[id]
            }
        } else {
            throw new ContainerConfigError('Invalid register id type')
        }
    }

    async get(id) {
        if (!this.hasRegistration(id)) {
            throw new ContainerConfigError(`No registration found for id: ${id}`)
        }

        if (this.depsInResolving.has(id)) {
            throw new ContainerCyclicDependenceError(`Dependency cycle detected for id: ${id}`)
        }

        const registration = this.registrations[id]

        let result
        this.depsInResolving.add(id)
        if (registration.lifetime === LIFETIME_SINGLETON) {
            if (!this.singletons.hasOwnProperty(id)) {
                this.singletons[id] = await this.build(registration)
            }
            result = this.singletons[id]
        } else {
            result = await this.build(registration)
        }
        this.depsInResolving.delete(id)
        return result
    }

    async build(config) {
        let deps = []
        if ('undefined' === typeof config.dependencies) {
            if ('undefined' !== typeof config.value._deps) {
                if (!Array.isArray(config.value._deps)) {
                    throw new ContainerConfigError('Registration value has invalid _deps')
                }
                deps = config.value._deps
            }
        } else {
            deps = config.dependencies
        }

        switch (config.type) {
            case TYPE_CLASS:
                return await this.buildClass(config.value, deps)
            case TYPE_FUNCTION:
                return await this.buildFunction(config.value, deps)
            case TYPE_FACTORY:
                return await this.buildFactory(config.value, config)
            case TYPE_VALUE:
                return config.value
            default:
                throw new ContainerConfigError(`Invalid type for building: ${config.type}`)
        }
    }

    async buildClass(classFunction, dependencies) {
        const deps = await this.resolveDependencies(dependencies)
        return new classFunction(deps)
    }

    async buildFunction(func, dependencies) {
        const deps = await this.resolveDependencies(dependencies)
        return (...args) => func(deps, ...args)
    }

    async buildFactory(factory, config) {
        const deps = await this.resolveDependencies(config.dependencies || [])
        let value = factory(deps, this, config)
        if ('object' === typeof value && value instanceof Promise) {
            value = await value
        }
        return value
    }

    async resolveDependencies(dependencies) {
        let resolvedDeps = {}
        for (const depId of dependencies) {
            resolvedDeps[depId] = await this.get(depId)
        }
        return resolvedDeps
    }

}

const resolveConfigArguments = (args) => {
    let result = {}
    for (const argument of args) {
        if ('number' === typeof argument) {
            if ('undefined' !== typeof result.lifetime) {
                throw new ContainerConfigError('Seems to duplicate lifetime in arguments')
            }
            result.lifetime = argument
        } else if (Array.isArray(argument)) {
            if ('undefined' !== typeof result.dependencies) {
                throw new ContainerConfigError('Seems to duplicate dependencies list in arguments')
            }
            result.dependencies = argument
        } else {
            throw new ContainerConfigError('Can\'t resolve config argument type')
        }
    }
    return result
}

export const asValue = (value) => {
    return {
        value: value,
        type: TYPE_VALUE
    }
}

export const asClass = (classValue, ...args) => {
    return {
        value: classValue,
        type: TYPE_CLASS,
        ...resolveConfigArguments(args)
    }
}

export const asFunction = (functionValue, ...args) => {
    return {
        value: functionValue,
        type: TYPE_FUNCTION,
        ...resolveConfigArguments(args)
    }
}

export const asFactory = (factoryValue, ...args) => {
    return {
        value: factoryValue,
        type: TYPE_FACTORY,
        ...resolveConfigArguments(args)
    }
}