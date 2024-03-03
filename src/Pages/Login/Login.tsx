import React, { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import GeneralForm from '../../classes/GeneralForm.js';

import { userContext } from '../../globalState/userState.js';

import { FormSingleFieldType } from '../../types/forms/generalForm';
import { MapFormStatePayloadType } from '../../types/utils/formUtils';
import { UserLoginResponseType } from '../../types/api/userTypes.js';
import { UserSchemaType } from '../../types/User/UserSchema.js';
import { UserContextSchemaType, UserContextType } from '../../types/globalState/userState.js';

import { isFormValidated, mapFormStateToPayload, } from '../../utils/formUtils';
import { storeUserDetails, loginUser } from '../../utils/User/userUtils.js';

import { ApiPostNoAuth } from '../../api/ApiMethods';

import './Login.css';

const Login: React.FC = (): JSX.Element => {
    
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
            component: ({ name, type, value, placeholder, isTouched, isValid, errorMessage, onChangeHandler }): JSX.Element => {
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
        }
    ];
    // Static data end...

    // React Router hooks start...
    const navigate = useNavigate();
    // React Router hooks end...

    // Context API data start...
    const userContextData: UserContextType | null = useContext(userContext);
    const loggedInUser: UserContextSchemaType | null | undefined= userContextData?.user;
    const setUserState: ((userData: UserContextSchemaType) => void) | undefined = userContextData?.setUserState;
    // Context API data end...

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
    
            const res: UserLoginResponseType = await ApiPostNoAuth(`user/login`, payload);
            console.log(res, 'response');

            if (!res) {
                return;
            }
            
            setFormState(new GeneralForm(initFormFields));
            // storeUserDetails({
            //     ...res.payload.user,
            //     token: res.payload.token
            // });
            // setUserState?.({
            //     ...res.payload.user,
            //     token: res.payload.token
            // });

            loginUser({
                ...res?.payload?.user,
                token: res?.payload?.token
            }, setUserState);
            navigate(`/chats`);
        } catch (err) {
            console.log(err, 'LoginError');
        }
        
    }

    console.log(formState, 'formState');

    return (
        <>
            <div
                className={`login-root`}
            >
                <form
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
                                        isValid={formState.isFieldValidated(formField?.name)}
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

export default Login;