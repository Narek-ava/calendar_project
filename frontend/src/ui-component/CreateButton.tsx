import { useMemo } from 'react';
import { IUser } from '../models/IUser';
import { Tooltip } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Link } from 'react-router-dom';
import CreateButtonFab from './CreateButtonFab';

interface CreateButtonProps {
    user: IUser | null;
    maxCountReachedText: string;
    tooltipText: string;
    propertyName: 'employees' | 'locations' | 'services';
    action: string | (() => void);
}

const CreateButton = ({ user, maxCountReachedText, tooltipText, propertyName, action }: CreateButtonProps) => {
    const isNewButtonDisabled = useMemo(() => {
        if (!user) return true;

        const limits = user?.currentCompany.limits.max;
        if (!limits || !limits[propertyName]) return false;

        return user?.currentCompany.limits.counts[propertyName] >= ((limits && limits[propertyName]) ?? 0);
    }, [propertyName, user]);

    if (isNewButtonDisabled) {
        return (
            <Tooltip title={maxCountReachedText}>
                <span>
                    <CreateButtonFab color="secondary" disabled>
                        <AddIcon fontSize="small" />
                    </CreateButtonFab>
                </span>
            </Tooltip>
        );
    }

    return typeof action === 'string' ? (
        <Tooltip title={tooltipText}>
            <Link to={action}>
                <CreateButtonFab color="secondary">
                    <AddIcon fontSize="small" />
                </CreateButtonFab>
            </Link>
        </Tooltip>
    ) : (
        <Tooltip title={tooltipText} onClick={action}>
            <CreateButtonFab color="secondary">
                <AddIcon fontSize="small" />
            </CreateButtonFab>
        </Tooltip>
    );
};

export default CreateButton;
