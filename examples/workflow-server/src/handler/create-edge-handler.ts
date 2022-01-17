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
import { CreateEdgeOperationHandler, DefaultTypes, GEdge, GEdgeBuilder, GModelElement, GModelState } from '@eclipse-glsp/server-node';

export class CreateEdgeHandler extends CreateEdgeOperationHandler {
    label = 'Edge';
    elementTypeIds = [DefaultTypes.EDGE];

    createEdge(source: GModelElement, target: GModelElement, modelState: GModelState): GEdge | undefined {
        return new GEdgeBuilder(GEdge).sourceId(source.id).targetId(target.id).build();
    }
}