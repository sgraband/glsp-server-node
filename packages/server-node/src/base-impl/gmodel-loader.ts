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
import { GGraph, GModelRoot } from '@eclipse-glsp/graph';
import { isSModelRootSchema, RequestModelAction } from '@eclipse-glsp/protocol';
import * as fs from 'fs-extra';
import { inject, injectable } from 'inversify';
import { GModelSerializer } from '../features/model/gmodel-serializer';
import { ModelSourceLoader } from '../features/model/model-source-loader';
import { getOrThrow, GLSPServerError } from '../utils/glsp-server-error';
import { Logger } from '../utils/logger';
import { GModelState } from './gmodel-state';

export const EMTPY_ROOT = GGraph.builder().id('empty').build();

/**
 * A {@link ModelSourceLoader}  that reads the graph model directly from a JSON file and uses it as source model.
 */
@injectable()
export class GModelLoader implements ModelSourceLoader {
    @inject(Logger)
    protected logger: Logger;

    @inject(GModelSerializer)
    protected modelSerializer: GModelSerializer;

    @inject(GModelState)
    protected modelState: GModelState;

    loadSourceModel(action: RequestModelAction): void {
        const sourceUri = getOrThrow(
            this.modelState.sourceUri,
            `Invalid RequestModelAction! Missing argument with key '${GModelState.SOURCE_URI}'`
        );
        const root = this.loadFromFile(sourceUri);
        root.revision = -1;
        this.modelState.root = root;
    }

    protected loadFromFile(url: string): GModelRoot {
        try {
            const fileContent = this.readFile(url);
            if (!fileContent) {
                return EMTPY_ROOT;
            }
            if (!isSModelRootSchema(fileContent)) {
                throw new Error('The loaded root object is not of type SModelRootSchema');
            }
            return this.modelSerializer.createRoot(fileContent);
        } catch (error) {
            throw new GLSPServerError(`Could not load model from file: ${url}`, error);
        }
    }

    protected readFile(url: string): unknown {
        try {
            const data = fs.readFileSync(url, { encoding: 'utf8' });
            return JSON.parse(data);
        } catch (error) {
            throw new GLSPServerError(`Could not read & parse file contents of '${url}' as json`, error);
        }
    }
}
