import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import GeneralForm from '../../classes/GeneralForm.js';
import FormSingleField from '../../classes/Forms/FormSingleField.js';

import { FormSingleFieldType } from '../../types/forms/generalForm';
import { MapFormStatePayloadType } from '../../types/utils/formUtils';

import { isFormValidated, mapFormStateToPayload, } from '../../utils/formUtils';

import { ApiPost } from '../../api/ApiMethods';

import './Signup.css';

const Signup: React.FC = (): JSX.Element => {
    
    // Static data start...
    const initFormFields: Array<FormSingleFieldType> = [
        {
            name: 'name',
            type: 'text',
            placeholder: 'Type your name here...',
            value: '',
            isTouched: false,
            errorMessage: `Name length should be between 5 and 7`,
            mapToPayload: true,
            onChangeHandler: function(value: string) {
                return value;
            },
            isFieldValidated: function(this: GeneralForm, value: string) {
                return (value.length >= 5 && value.length <= 7);
            },
            component: ({ type, value, isTouched, placeholder, isValid, errorMessage, onChangeHandler }): JSX.Element => {
                console.log(value, isValid, 'name');
                return (
                    <>
                        <div
                            className={`form-input-container w-100`}
                        >
                            <label>Username</label>
                            <input
                                type={type}
                                value={value}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    onChangeHandler(e.target.value)
                                }}
                                placeholder={placeholder}
                            />

                            {isTouched && !isValid ? (
                                <p>
                                    {errorMessage}
                                </p>
                            ) : null}
                        </div>
                    </>
                )
            }
        },
        {
            name: 'password',
            type: 'password',
            placeholder: 'Type your password here...',
            value: '',
            isTouched: false,
            errorMessage: `Password length should be greater than 7`,
            mapToPayload: true,
            onChangeHandler: function(value: string) {
                return value;
            },
            isFieldValidated: function(this: GeneralForm, value: string) {
                return (value.length >= 5);
            },
            component: ({ type, value, isTouched, placeholder, isValid, errorMessage, onChangeHandler }): JSX.Element => {
                return (
                    <>
                        <div
                            className={`form-input-container w-100`}
                        >
                            <label>Password</label>
                            <input 
                                type={type}
                                value={value}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    onChangeHandler(e.target.value)
                                }}
                                placeholder={placeholder}
                            />

                            {isTouched && !isValid ? (
                                <p>
                                    {errorMessage}
                                </p>
                            ) : null}
                        </div>
                    </>
                )
            }
        },
        {
            name: 'confirm_password',
            type: 'password',
            placeholder: 'Repeat your password here...',
            value: '',
            isTouched: false,
            errorMessage: `Password doesn't match`,
            mapToPayload: false,
            onChangeHandler: function(value: string) {
                return value;
            },
            isFieldValidated: function(this: GeneralForm) {
                let isFieldValidated: boolean = false;
                
                let password: FormSingleFieldType | null = null;
                let confirm_password: FormSingleFieldType | null = null;

                for (let i: number = 0; i < this.formFields.length; i++) {
                    if (this.formFields[i]?.name === 'password') {
                        password = this.formFields[i];
                    } else if (this.formFields[i]?.name === 'confirm_password') {
                        confirm_password = this.formFields[i];
                    }

                    if (password && confirm_password) break;
                }
                
                isFieldValidated = (password?.value === confirm_password?.value);
                return isFieldValidated;
            },
            component: ({ name, type, value, placeholder, isTouched, isValid, errorMessage, onChangeHandler }): JSX.Element => {
                return (
                    <>
                        <div
                            className={`form-input-container w-100`}
                        >
                            <label>Confirm Password</label>
                            <input 
                                type={type}
                                value={value}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    onChangeHandler(e.target.value);
                                }}
                                placeholder={placeholder}
                            />

                            {isTouched && !isValid ? (
                                <p>
                                    {errorMessage}
                                </p>
                            ) : null}
                        </div>
                    </>
                )
            }
        }
    ];
    // Static data end...

    // React Router hooks start...
    const navigate = useNavigate();
    // React Router hooks end...

    const [formState, setFormState] = useState<GeneralForm>(new GeneralForm(initFormFields));

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            e.stopPropagation();
    
            const isFormValid: boolean = isFormValidated(formState);
    
            if (!isFormValid) {
                alert(`Please check all the form inputs!`);
                return;
            }
    
            const payload: MapFormStatePayloadType = mapFormStateToPayload(formState);
    
            const res = await ApiPost(`user/signup`, payload);

            if (!res) {
                setFormState(new GeneralForm(initFormFields));
                navigate(`/login`);
            }
        } catch (err) {
            console.log(err);
        }
        
    }

    console.log(formState, 'formState');

    return (
        <>
            <div
                className={`signup-root`}
            >
                <form
                    // className={`signup-root-form-container`}
                    className={`form-container form-normal-width`}
                    onSubmit={onSubmit}
                >
                    {formState.formFields.map((formField: FormSingleFieldType, formFieldIdx: number) => {
                        return (
                            <React.Fragment key={formField.name}>
                                <div
                                    className={`signup-form-container-formfield`}
                                >
                                    <formField.component 
                                        name={formField.name}
                                        type={formField.type}
                                        value={formField.value}
                                        isTouched={formField.isTouched}
                                        errorMessage={formField.errorMessage}
                                        onChangeHandler={(value: string) => {
                                            const updatedFormState: GeneralForm = {
                                                ...formState.onChangeHandler(formField.name, value)
                                            };
                                            
                                            setFormState(updatedFormState);
                                        }}
                                        isValid={formState.isFieldValidated(formField.name)}
                                        placeholder={formField.placeholder}
                                    />
                                </div>
                            </React.Fragment>
                        )   
                    })}

                    <button>
                        Submit
                    </button>
                </form>
            </div>
        </>
    );
};

export default Signup;