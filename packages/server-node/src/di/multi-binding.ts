/********************************************************************************
 * Copyright (c) 2022 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import { distinctAdd, flatPush, MaybeArray, remove } from '@eclipse-glsp/protocol';
import { interfaces } from 'inversify';
import { ModuleContext } from './glsp-module';

/**
 * A helper class used in `GLSPModules` to ease the configuration of multi-injected service identifiers.
 * Instead of directly binding to the service identifier a new multi binding object can be created. This object
 * should then be passed to a overridable configuration-function (i.e. configure(binding:V)=>void). This gives subclasses of the
 * `GLSPModule` the chance to manipulate the binding configuration using the provided manipulation methods (e.g. add,remove, rebind).
 * Once the configuration is finished the binding can be finalized using the {@link MultiBinding.applyBindings} method.
 */
export abstract class MultiBinding<T> {
    protected bindings: T[] = [];

    constructor(readonly identifier: string | symbol) {}

    abstract applyBindings(context: ModuleContext): void;

    add(newBinding: T): boolean {
        return distinctAdd(this.bindings, newBinding);
    }

    addAll(newBindings: T[]): boolean;
    addAll(...newBindings: T[]): boolean;
    addAll(...newBindings: MaybeArray<T>[]): boolean {
        const result: T[] = [];
        flatPush(result, newBindings);
        return result.every(newBinding => this.add(newBinding));
    }

    remove(toRemove: T): boolean {
        return remove(this.bindings, toRemove);
    }

    removeAll(toRemove: T[]): boolean {
        return toRemove.every(binding => this.remove(binding));
    }

    rebind(oldBinding: T, newBinding: T): void {
        if (this.remove(oldBinding)) {
            this.add(newBinding);
        }
    }

    contains(binding: T): boolean {
        return this.bindings.includes(binding);
    }

    getAll(): T[] {
        return this.bindings;
    }
}

/**
 * Implementation of {@link MultiBinding} for multi-injected values that should be bound to classes using the
 * `bind(serviceIdentifier).to(MyCustomBinding) syntax.
 *
 * @typeparam T the base type of the classes.
 */
export class ClassMultiBinding<T> extends MultiBinding<interfaces.Newable<T>> {
    applyBindings(context: ModuleContext): void {
        this.bindings.forEach(binding => context.bind(this.identifier).to(binding));
    }
}

/**
 * Implementation of {@link MultiBinding} for multi-injected values that should be bound to concrete instance using the
 * `bind(serviceIdentifier).toConstantValue(MyCustomBinding) syntax.
 *
 * * @typeparam T the type of the instances
 */
export class InstanceMultiBinding<T> extends MultiBinding<T> {
    applyBindings(context: ModuleContext): void {
        context.bind(this.identifier).toConstantValue(this.bindings);
    }
}
