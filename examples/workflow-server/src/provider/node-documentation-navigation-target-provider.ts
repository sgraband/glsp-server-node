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
import { Args, EditorContext, NavigationTarget } from '@eclipse-glsp/protocol';
import { GModelState } from '@eclipse-glsp/server-node';
import { NavigationTargetProvider } from '@eclipse-glsp/server-node/lib/features/navigation/navigation-target-provider';
import { inject, injectable } from 'inversify';
import { TaskNode } from '../graph-extension';
import { JsonOpenerOptions } from '@eclipse-glsp/server-node/lib/features/navigation/json-opener-options';

@injectable()
export class NodeDocumentationNavigationTargetProvider implements NavigationTargetProvider {
    targetTypeId = 'documentation';

    @inject(GModelState)
    protected readonly modelState: GModelState;

    getTargets(editorContext: EditorContext): NavigationTarget[] {
        if (editorContext.selectedElementIds.length === 1) {
            const taskNode = this.modelState.index.findByClass(editorContext.selectedElementIds[0], TaskNode);
            if (!taskNode || !(taskNode.id === 'task0')) {
                return [];
            }

            const sourceUri = this.modelState.sourceUri;
            if (!sourceUri) {
                return [];
            }

            const docUri = sourceUri.replace('.wf', '.md');
            const args: Args = {};
            args['jsonOpenerOptions'] = new JsonOpenerOptions({
                start: { line: 2, character: 3 },
                end: { line: 2, character: 7 }
            }).toJson();
            return [{ uri: docUri, args: args }];
        }
        return [];
    }
}
