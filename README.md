# @sagifire/di-container

This library implements a simple Inversion of Control (IoC) container with support for various object types and lifetimes, compatible with both JavaScript and TypeScript.

## Overview

A minimalistic IoC container for managing dependencies in your application. It provides `Container`, `asValue`, `asClass`, `asFunction`, and `asFactory` helpers.

## Why Choose @sagifire/di-container?

*   **Simplicity:** Get started quickly with a straightforward API. No complex configuration or steep learning curve.
*   **Lightweight:** Minimal footprint, ideal for projects where bundle size matters.
*   **Flexibility:** Supports various registration types (values, classes, functions, factories) and lifetimes.
*   **Asynchronous Ready:** Built-in support for async factories and dependency resolution.
*   **TypeScript Friendly:** Offers strong typing support when used with TypeScript.
*   **Reliable:** Works seamlessly with code obfuscation and minification.

If you need a simple, reliable, and flexible IoC container without the overhead of larger frameworks, @sagifire/di-container is an excellent choice.

## Documentation

For detailed usage instructions and examples, please refer to the specific guides:

*   **JavaScript:**
    *   [English Guide](./documentation/js_en.md)
    *   [Ukrainian Guide (Українська інструкція)](./documentation/js_uk.md)
*   **TypeScript:**
    *   [English Guide](./documentation/ts_en.md)
    *   [Ukrainian Guide (Українська інструкція)](./documentation/ts_uk.md)

These guides cover:
*   Container creation and component registration (`register`)
*   Component types (`asValue`, `asClass`, `asFunction`, `asFactory`)
*   Lifetimes (`LIFETIME_SINGLETON`, `LIFETIME_DYNAMIC`)
*   Defining and injecting dependencies (`_deps`, `deps`)
*   Using asynchronous factories
*   Building instances outside the container (`build`)
*   Handling inheritance
