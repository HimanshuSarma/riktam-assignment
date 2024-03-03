import React, { ChangeEvent } from 'react';

import GeneralForm, { FormIsFieldValidatedHandler } from '../../classes/GeneralForm';

interface FormFieldComponentPropType extends FormSingleFieldUIPropType {
    isValid: boolean
};

interface FormSingleFieldUIPropType {
    name: string,
    value: string,
    placeholder: string,
    type: string,
    isTouched: boolean,
    errorMessage: string,
    onChangeHandler: (value: string) => void,
    // isValid: boolean,
};

interface FormSingleFieldType extends FormSingleFieldUIPropType {
    isFieldValidated: (this: GeneralForm, value: string) => boolean,
    mapToPayload: boolean,
    onChangeHandler: (value: string) => string,
    component: React.FC<FormFieldComponentPropType>
};


export type { FormSingleFieldType, FormSingleFieldUIPropType, FormFieldComponentPropType };