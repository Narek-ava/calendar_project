import { useRef, useState } from 'react';
import { ISuggestion } from './types';
import useAutoCompleteInput from './useAutoCompleteInput';
import { Button, Stack, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/core/Autocomplete';
import styled from '@emotion/styled/macro';
import { debounce } from 'lodash';
import { initialAddress } from '../../../views/company/CompanyForm';
import { IAddress } from '../../../models/IAddress';

const Li = styled.li`
    border-bottom: 1px solid #ccc;
    &:last-child {
        border-bottom: none;
    }
`;

interface AddressAutocompleteProps {
    address: IAddress;
    setAddress: (arg: IAddress) => void;
    hideResetButton?: boolean;
    variant?: 'filled' | 'standard' | 'outlined';
    autocompleteClassName?: string;
    inputClassName?: string;
}

const AddressAutocomplete = ({
    address,
    setAddress,
    hideResetButton,
    variant,
    autocompleteClassName,
    inputClassName
}: AddressAutocompleteProps) => {
    const [isFetchingEntries, setIsFetchingEntries] = useState(false);
    const [addressObject, setAddressObject] = useState<ISuggestion | null>(null);
    const [streetAddress, setStreetAddress] = useState('');

    const { searchVal, getSuggestions, setSuggestions, suggestions, handleChange } = useAutoCompleteInput();
    // const { searchVal, getSuggestions, suggestions, handleChange } = useAutoCompleteInput();
    // const { setSuggestions, suggestions } = useAutoCompleteInput();

    const debounced = useRef(
        debounce((newValue) => {
            if (newValue) {
                handleChange(newValue);
            }
        }, 500)
    );

    const handleSearch = (arg: string) => {
        debounced.current(arg.toLowerCase());
    };

    const handleStreetChange = (inputValue: string) => {
        handleSearch(inputValue);
        setStreetAddress(inputValue);
    };

    const handleSuggestionClick = (suggestion: ISuggestion) => {
        const addressStringToReturn =
            suggestion.entries > 1
                ? `${suggestion.street_line}`
                : `${suggestion.street_line} ${suggestion.secondary} ${suggestion.city} ${suggestion.state} ${suggestion.zipcode}`;
        const l2ToReturn = suggestion.entries > 1 ? `` : `${suggestion.secondary}`;
        const newAddressValues = {
            address: `${suggestion.street_line} ${l2ToReturn}, ${suggestion.city}, ${suggestion.state} ${suggestion.zipcode}`,
            l1: suggestion.street_line,
            l2: l2ToReturn,
            city: suggestion.city,
            state: suggestion.state,
            postal_code: suggestion.zipcode,
            country: 'USA'
        };

        if (suggestion.entries > 0) {
            const { id, ...rawSuggestion } = suggestion;
            getSuggestions(searchVal, rawSuggestion);
        }

        setStreetAddress(addressStringToReturn);
        setAddress(newAddressValues);
        setSuggestions([]);
        setAddressObject(suggestion);
    };

    const handleReset = () => {
        setAddressObject(null);
        setAddress(initialAddress);
        setSuggestions([]);
        setStreetAddress('');
    };

    return (
        <Stack alignItems="flex-end">
            <Autocomplete
                className={autocompleteClassName}
                fullWidth
                disablePortal
                id="combo-box-demo"
                value={addressObject}
                clearIcon=""
                onBlur={() => {}}
                inputValue={streetAddress}
                onInputChange={(event: any, newInputValue, reason) => {
                    if (!newInputValue) {
                        setAddressObject(null);
                        setStreetAddress('');
                        setSuggestions([]);
                        return;
                    }
                    handleStreetChange(newInputValue);
                }}
                onChange={(event: any, newValue: any) => {
                    if (newValue && event.type === 'keydown' && event.key === 'Enter') {
                        handleSuggestionClick(newValue);
                    }
                    if (typeof newValue === 'string') {
                        handleReset();
                    }
                }}
                options={suggestions}
                noOptionsText="No data"
                getOptionLabel={(option: ISuggestion) => {
                    const stringToReturn =
                        option.entries > 1
                            ? `${option.street_line} ${option.secondary} (${option.entries} entries) ${option.city} ${option.state} ${option.zipcode}`
                            : `${option.street_line} ${option.secondary} ${option.city} ${option.state} ${option.zipcode}`;
                    return isFetchingEntries ? `${option.street_line}` : stringToReturn;
                }}
                isOptionEqualToValue={(option, value: ISuggestion) => option.id === value.id}
                freeSolo
                // disableClearable
                clearOnBlur={false}
                renderOption={(props, option, index) => {
                    // const stringToReturn = `${suggestion?.street_line} ${suggestion?.secondary} (${suggestion?.entries}) ${suggestion?.city} ${suggestion?.state} ${suggestion?.zipcode}`;
                    const stringToReturn =
                        option.entries > 1
                            ? `${option.street_line} ${option.secondary} (${option.entries} entries) ${option.city} ${option.state} ${option.zipcode}`
                            : `${option.street_line} ${option.secondary} ${option.city} ${option.state} ${option.zipcode}`;
                    return (
                        <Li
                            {...props}
                            key={option.id}
                            onClick={() => {
                                if (!isFetchingEntries && option.entries > 1) {
                                    setIsFetchingEntries(true);
                                } else {
                                    setIsFetchingEntries(false);
                                }
                                if (option.id === addressObject?.id) {
                                    setAddressObject(option);
                                    return;
                                }
                                handleSuggestionClick(option);
                            }}
                        >
                            {stringToReturn}
                        </Li>
                    );
                }}
                sx={{ my: 2 }}
                renderInput={(params) => (
                    <TextField
                        className={inputClassName}
                        {...params}
                        variant={variant || 'filled'}
                        label="Search Address"
                        autoComplete="off"
                        inputProps={{
                            ...params.inputProps,
                            type: 'search',
                            onKeyDown: () => {}
                        }}
                    />
                )}
            />
            {!hideResetButton && (
                <Button onClick={handleReset} sx={{ textTransform: 'lowercase' }}>
                    reset address fields
                </Button>
            )}
        </Stack>
    );
};

export default AddressAutocomplete;
