// Most probably not required


import { FormSingleFieldType, FormSingleFieldUIPropType } from "../../types/forms/generalForm";
import { FormFieldComponentPropType } from "../../types/forms/generalForm";
import GeneralForm from "../GeneralForm.js";

class FormSingleField {
    name: string;
    type: string;
    value: string;
    isTouched: boolean;
    mapToPayload: boolean;
    errorMessage: string;
    component: React.FC<FormFieldComponentPropType>;
    isFieldValidated: (this: GeneralForm, value: string) => boolean;
    onChangeHandler: (value: string) => string;
    constructor(formField: FormSingleFieldType) {
        this.name = formField.name;
        this.type = formField.type;
        this.value = formField.value;
        this.isTouched = formField.isTouched;
        this.mapToPayload = formField.mapToPayload;
        this.errorMessage = formField.errorMessage;
        this.component = formField.component;
        this.isFieldValidated = formField.isFieldValidated;
        this.onChangeHandler = formField.onChangeHandler;
    }
}

export default FormSingleField;