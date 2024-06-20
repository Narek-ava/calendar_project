import { useState } from 'react';
import { ISuggestion } from './types';
import axios from 'axios';

type JSONResponse = {
    suggestions: {
        street_line: string;
        secondary: string;
        city: string;
        state: string;
        zipcode: string;
        entries: number;
    }[];
};

const useAutoCompleteInput = () => {
    const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);
    const [searchVal, setSearchVal] = useState('');

    const getSuggestions = async (search: string, suggestion?: ISuggestion) => {
        const stringToReturn = `${suggestion?.street_line} ${suggestion?.secondary} (${suggestion?.entries}) ${suggestion?.city} ${suggestion?.state} ${suggestion?.zipcode}`;

        try {
            const response = await axios.get<JSONResponse>(
                `https://us-autocomplete-pro.api.smartystreets.com/lookup?key=117265192075895806&search=${search}&source=all&include_only_states=allstates&prefer_geolocation=none${
                    suggestion ? `&selected=${stringToReturn}` : ''
                }`
            );

            // base + extend with id?
            const withId = response.data.suggestions.map((suggestionItem) => ({
                ...suggestionItem,
                id: `${suggestionItem.street_line} ${suggestionItem.secondary} ${suggestionItem.city} ${suggestionItem.state} ${suggestionItem.zipcode}`
            }));
            setSuggestions(withId);
        } catch (err) {
            // console.log(err);
        }
    };

    const handleChange = (search: string) => {
        setSearchVal(search);
        getSuggestions(search);
    };

    return {
        suggestions,
        setSuggestions,
        getSuggestions,
        searchVal,
        handleChange
    };
};

export default useAutoCompleteInput;
