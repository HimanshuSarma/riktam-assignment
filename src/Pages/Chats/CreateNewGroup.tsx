import React, { useState, useEffect, useContext, useMemo } from "react";

import * as MultiSelectSearch from "../../components/MultiSelectSearch/MultiSelectSearch";

import GeneralForm from "../../classes/GeneralForm";

import { ApiGet, ApiPost } from "../../api/ApiMethods";

import { userContext } from "../../globalState/userState";

import { FormSingleFieldType } from "../../types/forms/generalForm";
import { UserContextSchemaType, UserContextType } from "../../types/globalState/userState";
import { UserSchemaType } from "../../types/User/UserSchema";
import { GetAllUsersResponseType } from "../../types/api/userTypes.js";
import { MapFormStatePayloadType } from "../../types/utils/formUtils";
import { OptionValueType } from "../../types/components/MultiSelectSearch";
import { OptionType } from "../../types/components/MultiSelectSearch";
import { CreateNewGroupPropType } from "../../types/Pages/Chats";

import { getItem, setItem } from "../../utils/localStorage/allLocalStorageHandlers";
import { isFormValidated, mapFormStateToPayload } from "../../utils/formUtils";

import './CreateNewGroup.css';

const CreateNewGroup: React.FC<CreateNewGroupPropType> = ({ createNewChatRoomHandler }): JSX.Element => {

    // Static data start...
    const initFormFields: Array<FormSingleFieldType> = [
        {
            name: 'name',
            type: 'text',
            placeholder: 'Type the name here...',
            value: '',
            isTouched: false,
            errorMessage: `Name length should be less than or equal to 10`,
            mapToPayload: true,
            onChangeHandler: function(value: string) {
                return value;
            },
            isFieldValidated: function(this: GeneralForm, value: string) {
                return (value.length <= 10);
            },
            component: ({ type, value, isTouched, isValid, placeholder, errorMessage, onChangeHandler }): JSX.Element => {
                // console.log(value, isValid, 'name');
                return (
                    <>
                        <div
                            className={`signup-form-input-container`}
                        >
                            <label>Group Name</label>
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

    // Context API data start...
    const userContextData: UserContextType | null = useContext(userContext);
    const loggedInUser: UserContextSchemaType | null | undefined= userContextData?.user;
    // Context API data end...

    // State variables start...
    const [formState, setFormState] = useState<GeneralForm>(new GeneralForm(initFormFields));
    const [allUserOptions, setAllUserOptions] = useState<Array<OptionValueType>>([]);
    const [usersInGroupChat, setUsersInGroupChat] = useState<Array<OptionValueType>>([]);

    const [selectedOptions, setSelectedOptions] = useState<OptionType>({});
    const [unselectedOptions, setUnselectedOptions] = useState<OptionType>({});

    const [showDropdownList, setShowDropdownList] = useState<boolean>(true);

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchFilteredOptions, setSearchFilteredOptions] = useState<Array<OptionValueType>>([]);
    const [focusedOptionIdx, setFocusedOptionIdx] = useState<number>(-1);
    // State variables end...

    // Handlers start...
    const resetMultiSelectSearchStateHandler = () => {
        setSelectedOptions({});
        setShowDropdownList(false);
        setSearchQuery('');
        setSearchFilteredOptions([]);
        setFocusedOptionIdx(-1);

        const unselectedOptions: OptionType = {};
        for (let i = 0; i < allUserOptions.length; i++) {
            unselectedOptions[allUserOptions[i]._id] = allUserOptions[i];
        }

        setUnselectedOptions(unselectedOptions);
    }

    const resetFormStateHandler = () => {
        setFormState(new GeneralForm(initFormFields));
        setUsersInGroupChat([]);
        resetMultiSelectSearchStateHandler();
    }

    const onSubmit = (e: React.MouseEvent<HTMLFormElement, MouseEvent>) => {
        try {
            if (!loggedInUser?.token) {
                alert(`You are not logged in!`)
                return;
            };

            e?.stopPropagation();
            e?.preventDefault();
    
            const isFormValid: boolean = isFormValidated(formState);
    
            if (!isFormValid) {
                alert(`Please check all the form inputs!`);
                return;
            }
    
            // const payload: MapFormStatePayloadType = {
            //     ...mapFormStateToPayload(formState),
            //     users: usersInGroupChat?.map((user: OptionValueType, userIdx: number) => {
            //         return user?._id
            //     })
            // };
    
            // const res = ApiPost(`group/create`, payload);
            console.log('sendingEvent');
            createNewChatRoomHandler({ 
                ...mapFormStateToPayload(formState), 
                users: usersInGroupChat?.map((user: OptionValueType, userIdx: number) => {
                    return user?._id
                }) 
            });

            resetFormStateHandler();
        } catch (err) {
            console.log(err, 'chatroomcreateformsubmit');
        }
        
    }
    // Handlers end...

    // useEffects start...
    useEffect(() => {
        (async () => {
            try {
                if (loggedInUser?._id) {
                    const res: GetAllUsersResponseType = await ApiGet(`user/all`);
                    // console.log(res?.payload?.users?.filter?.((user: UserSchemaType) => {
                    //     if (user?._id !== loggedInUser?._id) {
                    //         return true;
                    //     } else {
                    //         return false;
                    //     }
                    // }), 'loggedInUser');
                    setAllUserOptions(res?.payload?.users?.
                        filter?.((user: UserSchemaType) => {
                        if (user?._id !== loggedInUser?._id) {
                            return true;
                        } else {
                            return false;
                        }
                    })?.
                        map((user: UserSchemaType): OptionValueType => {
                            return {
                                _id: user?._id,
                                value: user?._id,
                                label: user?.name
                            }
                        })
                    );
                }
                
            } catch (err) {
                console.log(err, 'getAllUsersError');
            }
        })();
    }, [loggedInUser]);
    // useEffects end...

    // console.log(allUsers, usersInGroupChat, 'allUsers');

    return (
        <>
            <div
                className={`create-group-root`}
            >
                <form
                    onSubmit={onSubmit}
                    className={`form-container form-normal-width`}
                >
                    {formState.formFields.map((formField: FormSingleFieldType, formFieldIdx: number) => {
                        return (
                            <React.Fragment key={formField.name}>
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
                                    placeholder={formField?.placeholder}
                                />
                            </React.Fragment>
                        )
                    })}


                    {allUserOptions?.length > 0 ? (
                        <div>
                            <label>Select users...</label>
                            <MultiSelectSearch.default
                                options={allUserOptions}
                                onChange={(selectedOptions: Array<OptionValueType>) => {
                                    // console.log(selectedOptions, 'selectedOptions')
                                    setUsersInGroupChat(selectedOptions);
                                }}
                                selectedOptions={selectedOptions}
                                setSelectedOptions={setSelectedOptions}
                                unselectedOptions={unselectedOptions}
                                setUnselectedOptions={setUnselectedOptions}
                                showDropdownList={showDropdownList}
                                setShowDropdownList={setShowDropdownList}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                searchFilteredOptions={searchFilteredOptions}
                                setSearchFilteredOptions={setSearchFilteredOptions}
                                focusedOptionIdx={focusedOptionIdx}
                                setFocusedOptionIdx={setFocusedOptionIdx} 
                            />
                        </div>
                    ) : null}

                    <button>Submit</button>
                </form>
            </div>
        </>
    );
};

export default CreateNewGroup;