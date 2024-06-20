import OptimizedTextField from '../../../ui-component/optimized-text-fields/OptimizedTextField';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { setSearchString } from '../../../store/slices/calendarFilterSlice';

const SearchFilter = () => {
    const { searchString, showSearch } = useAppSelector((state) => state.calendarFilter);
    const dispatch = useAppDispatch();

    return showSearch ? (
        <OptimizedTextField
            id="search-filter"
            label="Search"
            size="small"
            value={searchString}
            onChange={(e) => {
                dispatch(setSearchString(e.target.value));
            }}
        />
    ) : null;
};

export default SearchFilter;
