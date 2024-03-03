interface OptionValueType {
    _id: string,
    label: string,
    value: string
};

interface OptionType {
    [key: string]: OptionValueType
};

interface MultiSelectSearchPropsType {
    options: Array<OptionValueType>,
    onChange: (selectedOptions: Array<OptionValueType>) => void,
    mapResponseToResults?: (results: any) => Array<OptionValueType>,
    mappingFn?: (item: OptionValueType) => OptionValueType,
    selectedOptions: OptionType,
    setSelectedOptions: React.Dispatch<React.SetStateAction<OptionType>>,
    unselectedOptions: OptionType,
    setUnselectedOptions: React.Dispatch<React.SetStateAction<OptionType>>,
    showDropdownList: boolean,
    setShowDropdownList: React.Dispatch<React.SetStateAction<boolean>>,
    searchQuery: string,
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
    searchFilteredOptions: Array<OptionValueType>,
    setSearchFilteredOptions: React.Dispatch<React.SetStateAction<Array<OptionValueType>>>,
    focusedOptionIdx: number,
    setFocusedOptionIdx: React.Dispatch<React.SetStateAction<number>>
};

export type { OptionType, OptionValueType, MultiSelectSearchPropsType };