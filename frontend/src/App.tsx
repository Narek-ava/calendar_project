import { useSelector } from 'react-redux';

import { ThemeProvider } from '@material-ui/core/styles';
import { Backdrop, CssBaseline, StyledEngineProvider } from '@material-ui/core';

// routing
import Routes from 'routes';

// store
import { DefaultRootStateProps } from 'types';

// defaultTheme
import themes from 'themes';

// project imports
import NavigationScroll from 'layout/NavigationScroll';
// import RTLLayout from 'ui-component/RTLLayout';
import Snackbar from 'ui-component/extended/Snackbar';
import ConfirmPopup from './ui-component/modals/ConfirmPopup';

// auth provider
import { SanctumProvider } from './contexts/SanctumContext';

import Head from './utils/head';
import { CircularProgress } from '@mui/material';
import { useAppSelector } from './hooks/redux';

// ==============================|| APP ||============================== //

const App = () => {
    const customization = useSelector((state: DefaultRootStateProps) => state.customization);
    const { isSubmitting } = useAppSelector((state) => state.submitting);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themes(customization)}>
                <CssBaseline />
                <NavigationScroll>
                    <SanctumProvider>
                        <>
                            <Head title="" />
                            <Routes />
                            <Snackbar />
                            <ConfirmPopup />
                        </>
                    </SanctumProvider>
                </NavigationScroll>
            </ThemeProvider>
            <Backdrop open={isSubmitting} sx={{ zIndex: 9999 }}>
                <CircularProgress color="success" />
            </Backdrop>
        </StyledEngineProvider>
    );
};

export default App;
