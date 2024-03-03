import GeneralForm from "../classes/GeneralForm.js";

import { MapFormStatePayloadType } from "../types/utils/formUtils.js";


const isFormValidated = (formState: GeneralForm): boolean => {

    for (let i: number = 0; i < formState.formFields.length; i++) {
        if (!formState.formFields[i].isFieldValidated?.call(formState, formState.formFields[i].value)) {
            return false;
        }
    }

    return true;
};

const mapFormStateToPayload = (formState: GeneralForm): MapFormStatePayloadType => {
    const payload: MapFormStatePayloadType = {};

    for (let i: number = 0; i < formState.formFields.length; i++) {
        if (formState.formFields[i].mapToPayload) {
            payload[formState.formFields[i].name] = formState.formFields[i].value;
        }
    }

    return payload;
};

export { mapFormStateToPayload, isFormValidated };