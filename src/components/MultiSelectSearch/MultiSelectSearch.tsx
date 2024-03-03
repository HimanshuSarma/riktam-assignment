import React, { useState, useEffect, useRef } from "react";

import { ApiGet } from "../../api/ApiMethods";

import { OptionType, OptionValueType, MultiSelectSearchPropsType } from "../../types/components/MultiSelectSearch";

import "./MultiSelectSearch.css";

const MultiSelectSearch: React.FC<MultiSelectSearchPropsType> = ({
  options,
  onChange,
  mapResponseToResults,
  mappingFn,
  selectedOptions,
  setSelectedOptions,
  unselectedOptions,
  setUnselectedOptions,
  showDropdownList,
  setShowDropdownList,
  searchQuery,
  setSearchQuery,
  searchFilteredOptions,
  setSearchFilteredOptions,
  focusedOptionIdx,
  setFocusedOptionIdx
}) => {
//   const [selectedOptions, setSelectedOptions] = useState<OptionType>({});
//   const [unselectedOptions, setUnselectedOptions] = useState<OptionType>({});

//   const [showDropdownList, setShowDropdownList] = useState<boolean>(false);

//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [searchFilteredOptions, setSearchFilteredOptions] = useState<Array<OptionValueType>>([]);
//   const [focusedOptionIdx, setFocusedOptionIdx] = useState<number>(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const parentContainerRef = useRef(null);

  const selectOptionHandler = (optionIdx: number) => {

    const selectedOption: OptionValueType = {
      ...searchFilteredOptions?.[optionIdx],
    };

    console.log(optionIdx, selectedOption, 'selectOptionHandler');

    setSelectedOptions((selectedOptions: OptionType) => {
      return {
        ...selectedOptions,
        [selectedOption?._id]: selectedOption,
      };
    });

    setSearchFilteredOptions((searchFilteredOptions) => {
      return searchFilteredOptions?.filter((filteredOption) => {
        return filteredOption?._id !== selectedOption?._id;
      });
    });

    searchInputRef.current?.focus();
  };

  const unselectOptionHandler = (optionId: string) => {
    const unselectedOption = {
      ...selectedOptions[optionId],
    };

    const unselectedOptionsArr = Object.entries(unselectedOptions);

    console.log(unselectedOption, "unselectedOption");

    const isUnSelectedOptionPresent = unselectedOptionsArr?.findIndex(
      (option) => {
        return option[1]?._id === unselectedOption?._id;
      },
    );

    console.log(isUnSelectedOptionPresent, "isUnSelectedOptionPresent");

    if (isUnSelectedOptionPresent >= 0) {
      setSearchFilteredOptions((searchFilteredOptions) => {
        return [unselectedOption, ...searchFilteredOptions];
      });
    }

    setSelectedOptions((selectedOptions) => {
      const newSelectedOptions = { ...selectedOptions };
      delete newSelectedOptions[optionId];
      return newSelectedOptions;
    });

    searchInputRef.current?.focus();
  };

  const clearAllSelectedItems = () => {
    setSearchFilteredOptions((searchFilteredOptions) => {
      const selectedOptionsArr = Object.entries(selectedOptions)?.map(
        (selectedOption) => {
          return selectedOption[1];
        },
      );

      return [
        ...selectedOptionsArr?.filter((option) => {
          return unselectedOptions[option?._id];
        }),
        ...searchFilteredOptions,
      ];
    });

    setSelectedOptions({});
    setFocusedOptionIdx(-1);

    searchInputRef.current?.focus();
  };

  const clearLatestPillHandler = () => {
    const selectedOptionsArr = Object.entries(selectedOptions);
    const latestPill = selectedOptionsArr?.[selectedOptionsArr?.length - 1]?.[1];
    setSelectedOptions((selectedOptions) => {
      const newSelectedOptions = { ...selectedOptions };
      delete newSelectedOptions[latestPill?._id];
      return newSelectedOptions;
    });

    const unselectedOptionsArr = Object.entries(unselectedOptions);

    const isUnSelectedOptionPresent = unselectedOptionsArr?.findIndex(
      (option) => {
        return option[1]?._id === latestPill?._id;
      },
    );

    if (isUnSelectedOptionPresent >= 0) {
      setSearchFilteredOptions((searchFilteredOptions) => {
        return [latestPill, ...searchFilteredOptions];
      });
    }

    searchInputRef.current?.focus();
  };

  useEffect(() => {
    const selectedOptionsArr: Array<OptionValueType> = [...Object.entries(selectedOptions)]
        .map((selectedOptionItem: Array<string | OptionValueType>, selectedOptionIdx: number) => {
            const selectedOption: OptionValueType = selectedOptionItem[1] as OptionValueType;
            return selectedOption;
        });
    onChange(selectedOptionsArr);
  }, [selectedOptions]);

  useEffect(() => {
    let timeoutId: number;
    if (typeof options === "string") {
      if (searchQuery === "") {
        setUnselectedOptions({});
        return;
      }

      const baseUrl = options;
      timeoutId = setTimeout(() => {
        (async () => {
          try {
            const res: any = await ApiGet(`/search?q=${searchQuery}`, undefined, baseUrl);
            const results: Array<OptionValueType> | undefined = mapResponseToResults?.(res);

            const unselectedOptions: OptionType = {};
            let currentItem: OptionValueType | undefined;

            results?.map((item: OptionValueType) => {
              currentItem = mappingFn?.(item);
              if (currentItem) {
                unselectedOptions[currentItem?._id] = currentItem;
              }
            });

            setUnselectedOptions(unselectedOptions);
          } catch (err) {
            console.log("error", err);
          }
        })();
      }, 1000);
    } else if (Array.isArray(options)) {
      const unselectedOptions: OptionType = {};

      const filteredOptions = options?.filter((option) => {
        return option?.label
          ?.toLowerCase()
          .includes(searchQuery?.toLowerCase());
      });

      if (focusedOptionIdx > filteredOptions?.length - 1) {
        setFocusedOptionIdx(0);
      }

      filteredOptions?.map((item) => {
        unselectedOptions[item?._id] = item;
      });
      setUnselectedOptions(unselectedOptions);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  useEffect(() => {
    const unselectedOptionsArr = Object.entries(unselectedOptions);

    setSearchFilteredOptions(
      unselectedOptionsArr
        ?.filter((option) => {
          return !selectedOptions[option[1]?._id];
        })
        ?.map((option) => {
          return option[1];
        }),
    );
  }, [unselectedOptions]);

  useEffect(() => {
    console.log('baseeffect');
    if (!Array.isArray(options)) return;
    const unselectedOptions: OptionType = {};
    for (let i = 0; i < options.length; i++) {
      unselectedOptions[options[i]._id] = options[i];
    }

    setUnselectedOptions(unselectedOptions);
  }, [options]);

  useEffect(() => {
    return () => {
      console.log('unmounted');
    }
  }, []);

  // console.log(
  //   showDropdownList,
  //   selectedOptions,
  //   searchFilteredOptions,
  //   unselectedOptions,
  //   focusedOptionIdx,
  //   "MultiSelect",
  // );

  return (
    <>
      <div
        className={`${
          showDropdownList ? `full-screen-active` : `full-screen-inactive`
        } multiselect-parent-container`}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.target === parentContainerRef?.current) {
              setShowDropdownList(false);
            }
        }}
        ref={parentContainerRef}
      >
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            backgroundColor: "darkgray",
            border: Object.entries(selectedOptions)?.length > 0 ? "1px solid black" : "",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            {[...Object.entries(selectedOptions), "input"]?.map(
              (selectedOptionItem: Array<string | OptionValueType> | string) => {
                if (selectedOptionItem === "input") {
                  return (
                    <input
                      key={selectedOptionItem}
                      ref={searchInputRef}
                      name=""
                      value={searchQuery}
                      placeholder={`Type here(Click to show dropdown)...`}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        console.log('query', e);
                        setSearchQuery(e.target.value);
                      }}
                      onClick={(e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
                        e?.stopPropagation();
                        e?.preventDefault();
                        setShowDropdownList(true);
                      }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        console.log(e, 'event');
                        if (e.code === "Backspace" && searchQuery === "") {
                          clearLatestPillHandler();
                        } 
                        
                        // else if (e.code === "ArrowDown") {
                        //   setFocusedOptionIdx((focusedOptionIdx) => {

                        //     if (searchFilteredOptions?.length === 0) {
                        //       return -1;
                        //     } 
                        //     return (
                        //       (focusedOptionIdx + 1) %
                        //       searchFilteredOptions?.length
                        //     );
                        //   });
                        // } else if (e.code === "ArrowUp") {
                        //   setFocusedOptionIdx((focusedOptionIdx) => {
                        //     if (searchFilteredOptions?.length === 0) {
                        //         return -1;
                        //     } else if (focusedOptionIdx <= 0) {
                        //       return searchFilteredOptions?.length - 1;
                        //     } else {
                        //       return (
                        //         (focusedOptionIdx - 1) %
                        //         searchFilteredOptions?.length
                        //       );
                        //     }
                        //   });
                        // } else if (e.code === "Enter") {
                        //     console.log(focusedOptionIdx, searchFilteredOptions);
                        //   if (
                        //     focusedOptionIdx >= 0 &&
                        //     focusedOptionIdx <=
                        //       searchFilteredOptions?.length - 1
                        //   ) {
                        //     console.log('Enter')
                        //     selectOptionHandler(focusedOptionIdx);
                        //     setFocusedOptionIdx(-1);
                        //   }
                        // }
                      }}
                      style={{
                        alignSelf: "flex-start",
                        width: '250px'
                      }}
                    />
                  );
                } else {
                    const selectedOptionId: string = selectedOptionItem[0] as string;
                    const selectedOption: OptionValueType = selectedOptionItem[1] as OptionValueType;

                    return (
                        <React.Fragment key={selectedOption?._id}>
                        <div
                            style={{
                            display: "flex",
                            gap: "0.25rem",

                            border: "1px solid grey",
                            }}
                        >
                            <span>{selectedOption?.label}</span>
                            <button
                              id={`multiselect-search-clear-btn`}
                              onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                console.log('cleared', e)
                                e?.stopPropagation();
                                e.preventDefault();
                                unselectOptionHandler(selectedOption?._id);
                              }}
                            >
                                Clear
                            </button>
                        </div>
                        </React.Fragment>
                    );
                }
              },
            )}
          </div>

          {Object.entries(selectedOptions)?.length > 0 ? (
            <button
              onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                e?.stopPropagation();
                e?.preventDefault();
                clearAllSelectedItems();
              }}
              style={{
                alignSelf: "flex-start",
                marginLeft: "auto",
              }}
            >
              Clear All
            </button>
          ) : null}
        </div>

        {showDropdownList ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              backgroundColor: "lightgray",
              position: "relative",
            }}
            onClick={(e) => {}}
          >
            {searchFilteredOptions?.map((option, optionIdx) => {
              return (
                <React.Fragment key={option?._id}>
                  <p
                    onClick={(e: React.MouseEvent<HTMLParagraphElement, MouseEvent>) => {
                      e?.stopPropagation();
                      e?.preventDefault();
                      selectOptionHandler(optionIdx);
                    }}
                    style={{
                      backgroundColor:
                        focusedOptionIdx === optionIdx ? "grey" : "",
                    }}
                    className={`multiselect-dropdown-item`}
                  >
                    {option?.label}
                  </p>
                </React.Fragment>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default MultiSelectSearch;
