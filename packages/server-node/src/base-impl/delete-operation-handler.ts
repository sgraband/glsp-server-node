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
import { DeleteElementOperation } from '@eclipse-glsp/protocol';
import { inject, injectable } from 'inversify';
import { GModelIndex } from '../features/model/gmodel-index';
import { GModelState } from './gmodel-state';
import { OperationHandler } from '../operations/operation-handler';
import { GEdge, GModelElement, GNode } from '@eclipse-glsp/graph';

@injectable()
export class DeleteOperationHandler implements OperationHandler {
    protected allDependantsIds: Set<string>;

    @inject(GModelState) protected readonly modelState: GModelState;

    get operationType(): string {
        return DeleteElementOperation.KIND;
    }

    execute(operation: DeleteElementOperation): void {
        const elementIds = operation.elementIds;
        if (!elementIds || elementIds.length === 0) {
            console.log('Elements to delete are not specified');
            return;
        }
        const index = this.modelState.index;
        this.allDependantsIds = new Set<string>();
        const success = elementIds.every(eId => this.delete(eId, index));
        if (!success) {
            console.log('Could not delete all elements as requested (see messages above to find out why)');
        }
    }

    protected delete(elementId: string, index: GModelIndex): boolean {
        if (this.allDependantsIds.has(elementId)) {
            return true;
        }

        let element;
        try {
            element = index.get(elementId);
        } catch {
            console.log('Element not found: ' + elementId);
            return false;
        }

        const nodeToDelete = this.findTopLevelElement(element);
        if (!nodeToDelete.parent) {
            console.log("The requested node doesn't have a parent; it can't be deleted");
            return false;
        }

        const dependents = new Set<GModelElement>();
        this.collectDependents(dependents, nodeToDelete, this.modelState);

        dependents.forEach(dependant => {
            const index = this.modelState.root.children.findIndex(element => element === dependant);
            if (index > -1) {
                this.modelState.root.children.splice(index, 1);
            }
            this.allDependantsIds.add(dependant.id);
        });

        return true;
    }

    protected collectDependents(dependents: Set<GModelElement>, nodeToDelete: GModelElement, modelState: GModelState): void {
        if (dependents.has(nodeToDelete)) {
            return;
        }

        if (nodeToDelete.children.length > 0) {
            nodeToDelete.children.forEach(child => this.collectDependents(dependents, child, modelState));
        }

        if (nodeToDelete instanceof GNode) {
            const index = this.modelState.index;
            index.getIncomingEdges(nodeToDelete).forEach(incoming => {
                this.collectDependents(dependents, incoming, modelState);
            });
            index.getOutgoingEdges(nodeToDelete).forEach(outgoing => {
                this.collectDependents(dependents, outgoing, modelState);
            });
        }

        dependents.add(nodeToDelete);
    }

    protected findTopLevelElement(element: GModelElement): GModelElement {
        if (element instanceof GNode || element instanceof GEdge) {
            return element;
        }

        const parent = element.parent;
        if (!parent) {
            return element;
        }
        return this.findTopLevelElement(parent);
    }
}