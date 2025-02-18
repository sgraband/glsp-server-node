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
import { Action, MaybePromise, NavigationTarget, RequestNavigationTargetsAction, SetNavigationTargetsAction } from '@eclipse-glsp/protocol';
import { injectable } from 'inversify';
import { inject } from 'inversify/lib/annotation/inject';
import { ActionHandler } from '../../actions/action-handler';
import { NavigationTargetProviderRegistry } from './navigation-target-provider-registry';

@injectable()
export class RequestNavigationTargetsActionHandler implements ActionHandler {
    actionKinds = [RequestNavigationTargetsAction.KIND];

    @inject(NavigationTargetProviderRegistry)
    protected navigationTargetProviderRegistry: NavigationTargetProviderRegistry;

    execute(action: RequestNavigationTargetsAction): MaybePromise<Action[]> {
        const editorContext = action.editorContext;
        const allTargets: NavigationTarget[] = [];
        const provider = this.navigationTargetProviderRegistry.get(action.targetTypeId);
        if (provider) {
            const targets = provider.getTargets(editorContext);
            targets.forEach(target => allTargets.push(target));
        }
        return [new SetNavigationTargetsAction(allTargets, action.requestId, editorContext.args)];
    }
}
