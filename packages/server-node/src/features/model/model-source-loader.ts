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
import { MaybePromise, RequestModelAction } from '@eclipse-glsp/protocol';

export const ModelSourceLoader = Symbol('ModelSourceLoader');

/**
 * A source model loader loads models into the model state.
 *
 * A `source model` is an arbitrary model from which the graph model of the diagram is to be created.
 * Implementations of source model loaders are specific to the type of source model or persistence format that is used
 * for a type of source model. A source model loader obtains the information on which source model shall loaded from a
 * {@link RequestModelAction}; typically its client options. Once the source model is loaded, a model loader is expected
 * to put the loaded source model into the model state for further processing, such as transforming the loaded model
 * into a graph model (see GModelFactory).
 *
 * @see ClientOptionsUtil
 * @see GModelFactory
 */
export interface ModelSourceLoader {
    /**
     * Loads a source model into the `modelState`.
     *
     * @param action Action sent by the client to specifying the information needed to load the source model.
     */
    loadSourceModel(action: RequestModelAction): MaybePromise<void>;
}
