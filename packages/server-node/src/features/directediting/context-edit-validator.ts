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
import { GModelElement } from '@eclipse-glsp/graph/lib/gmodel-element';
import { RequestEditValidationAction, ValidationStatus } from '@eclipse-glsp/protocol';
import { GModelState } from '../../base-impl/gmodel-state';
import { LabelEditValidator } from './label-edit-validator';

export const ContextEditValidator = Symbol('ContextEditValidator');

export interface ContextEditValidator {
    /**
     * Returns the context id of the {@link ContextActionsProvider}.
     */
    contextId: string;

    /**
     * Returns the {@link ValidationStatus} for a given {@link RequestEditValidationAction}.
     *
     * @param action The RequestEditValidationAction to validate.
     * @returns The {@link ValidationStatus} for a given {@link RequestEditValidationAction}.
     */
    validate(action: RequestEditValidationAction): ValidationStatus;
}

export class ValidateLabelEditAdapter implements ContextEditValidator {
    labelEditValidator: LabelEditValidator;
    constructor(readonly modelState: GModelState, labelEditValidator: LabelEditValidator) {
        this.labelEditValidator = labelEditValidator;
    }

    get contextId(): string {
        return LabelEditValidator.CONTEXT_ID;
    }

    validate(action: RequestEditValidationAction): ValidationStatus {
        const element = this.modelState.index.get(action.modelElementId);
        if (element instanceof GModelElement) {
            return this.labelEditValidator.validate(action.text, element);
        }
        return { severity: ValidationStatus.Severity.OK };
    }
}
