import { useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// mui
import { FormControl, Select, Stack, Tooltip } from '@mui/material';
import { Avatar, Button, MenuItem, Typography } from '@material-ui/core';
import AddBoxOutlined from '@material-ui/icons/AddBoxOutlined';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core/styles';
import { SxProps } from '@material-ui/system';

// project imports
import EllipsisTypography from '../../ui-component/optimized-text-fields/EllipsisTypography';
import { AbilityContext } from '../../utils/roles/Can';
import useAuth from '../../hooks/useAuth';
import { stringToColor } from '../../store/constant';
import { SET_MENU } from '../../store/actions';
import { useAppDispatch } from '../../hooks/redux';
import { replaceMinioToLocalhost } from '../../utils/functions/uploading-images-helpers';
import useChangeCompany from '../../hooks/useChangeCompany';
import usePlanName from '../../hooks/usePlanName';

// style const
const useStyles = makeStyles((theme: Theme) => ({
    companySelect: {
        '& > fieldset': {
            [theme.breakpoints.down('md')]: {
                borderWidth: '1px'
            }
        }
    },
    companySelectField: {
        [theme.breakpoints.down('md')]: {
            padding: '6px 32px 6px 10px !important'
        }
    }
}));

interface OrganizationSwitcherProps {
    isInSideBar?: boolean;
    sx?: SxProps;
}

const OrganizationSwitcher = ({ isInSideBar, sx = { mr: 3, ml: 3 } }: OrganizationSwitcherProps) => {
    const dispatch = useAppDispatch();
    const classes = useStyles();
    const ability = useContext(AbilityContext);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { handleChangeCompany } = useChangeCompany();
    const planName = usePlanName();

    const handleCreateCompany = useCallback(() => {
        navigate('/organization/create', { replace: true });
        if (isInSideBar) {
            dispatch({ type: SET_MENU, opened: false });
        }
    }, []);

    const isNewOrgButtonDisabled = useMemo(() => {
        if (!user?.companyOwner?.limits.max) return false;
        return user?.companyOwner?.limits.counts.companies >= (user?.companyOwner?.limits.max?.companies ?? 0);
    }, [user]);

    const getLogo = useCallback((logo) => replaceMinioToLocalhost(logo ? logo?.url : ''), []);

    const disabledTooltipText = useMemo(
        () =>
            user?.companyOwner?.limits.max?.companies === 1
                ? 'Your current plan is limited to having only one organization. If you need to create more than one, please contact support to upgrade your plan.'
                : `You're on the ${planName} subscription plan. Please contact support to upgrade your plan to be able to add more staff or locations`,
        [planName, user]
    );

    return (
        <FormControl sx={sx}>
            <Select
                labelId="demo-simple-select-label"
                id="company_id"
                name="company_id"
                size="small"
                value={user?.currentCompany.id}
                onChange={(e) => handleChangeCompany(Number(e.target.value))}
                sx={{
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}
                className={classes.companySelect}
                classes={{ select: classes.companySelectField }}
            >
                {user?.companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                        <Stack direction="row" alignItems="center">
                            <Avatar
                                color="inherit"
                                src={getLogo(company.logo)}
                                sx={{
                                    width: 24,
                                    height: 24,
                                    backgroundColor: company.logo ? 'transparent' : stringToColor(company.name),
                                    color: '#fff'
                                }}
                            >
                                <Typography>{company?.name.charAt(0).toUpperCase()}</Typography>
                            </Avatar>
                            <EllipsisTypography maxWidth={500} text={company.name} />
                        </Stack>
                    </MenuItem>
                ))}
                {ability.can('create', 'company') && (
                    <Tooltip
                        title={disabledTooltipText}
                        disableHoverListener={!isNewOrgButtonDisabled}
                        disableFocusListener={!isNewOrgButtonDisabled}
                        disableTouchListener={!isNewOrgButtonDisabled}
                    >
                        <span>
                            <Button
                                disabled={isNewOrgButtonDisabled}
                                onClick={handleCreateCompany}
                                size="large"
                                startIcon={<AddBoxOutlined />}
                                sx={{ width: '100%', padding: '6px 18px', justifyContent: 'flex-start' }}
                            >
                                New Organization
                            </Button>
                        </span>
                    </Tooltip>
                )}
            </Select>
        </FormControl>
    );
};

export default OrganizationSwitcher;
