import { FormSingleFieldType } from '../types/forms/generalForm';

type FormOnChangeHandler = (this: GeneralForm, name: string, value: string) => GeneralForm;
type FormIsFieldValidatedHandler = (this: GeneralForm, name: string) => boolean;

class GeneralForm {
    formFields: Array<FormSingleFieldType>;
    constructor(formFields: Array<FormSingleFieldType>) {
        this.formFields = formFields;
    };

    onChangeHandler: FormOnChangeHandler = function (this: GeneralForm, name: string, value: string) {
        this.formFields = this.formFields.map((formField: FormSingleFieldType, formFieldIdx: number) => {
            if (formField.name === name) {
                return {
                    ...formField,
                    value: formField.onChangeHandler(value),
                    isTouched: true
                }
            } else {
                return formField;
            }
        });

        console.log(this.formFields);

        return this;
    }

    isFieldValidated: FormIsFieldValidatedHandler = function (this: GeneralForm, name: string): boolean {
        let isFieldValidated: boolean = false;

        for (let i: number = 0; i < this.formFields.length; i++) {
            if (this.formFields[i]?.name === name) {
                isFieldValidated = this.formFields[i].isFieldValidated?.call(this, this.formFields[i].value);
            }
        }

        return isFieldValidated;
    }
}

export default GeneralForm;
export type { FormOnChangeHandler, FormIsFieldValidatedHandler };