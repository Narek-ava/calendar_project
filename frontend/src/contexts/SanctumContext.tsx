import React, { createContext, useEffect } from 'react';
import { ACCOUNT_INITIALIZE, LOGIN, LOGOUT } from 'store/account/actions';
import { axiosServices } from 'utils/axios';
// import Loader from 'ui-component/Loader';
import { initialLoginContextProps } from 'types';
import { IUser } from '../models/IUser';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store/store';
import { useLocation } from 'react-router-dom';
import config from '../config';
import Loader from '../ui-component/Loader';
import { useNavigate } from 'react-router';

interface registerProps {
    email: string;
    firstname: string;
    lastname: string;
    password: string;
    phone: string;
    address: {
        address: string;
        city: string;
        state: string;
        postal_code: string;
        l1?: string;
        l2?: string;
    };
    company: {
        name: string;
        subscription_type: string;
        time_zone: string;
    };
}

const initialState: initialLoginContextProps = {
    isLoggedIn: false,
    isInitialized: false,
    user: null
};

const SanctumContext = createContext({
    ...initialState,
    login: async (e: string, p: string) => {},
    register: async (values: registerProps) => {},
    logout: () => {},
    changeCompanyContext: async (companyId: number) => {},
    checkAuthentication: async () => {}
});

export const SanctumProvider = ({ children }: { children: React.ReactElement }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const state = useSelector((AppState: RootState) => AppState.account);

    const csrf = () => axiosServices.get('csrf-cookie');

    const signOut = async () => {
        try {
            await axiosServices.post('/logout');
            return true;
        } catch (error) {
            return error;
        }
    };

    const register = (values: registerProps): Promise<any> =>
        new Promise((resolve, reject) => {
            csrf()
                .then(() => {
                    axiosServices
                        .post('/validate-register', values)
                        .then(({ data }) => {
                            if (data?.url) window.location.href = data.url;
                        })
                        .catch((error) => {
                            reject(error);
                        });
                })
                .catch((error) => {
                    reject(error);
                });
        });

    const login = (email: string, password: string): Promise<any> =>
        new Promise((resolve, reject) => {
            csrf()
                .then(() => {
                    axiosServices
                        .post(
                            '/login',
                            {
                                email,
                                password,
                                remember: null
                            },
                            {
                                maxRedirects: 0
                            }
                        )
                        .then(() => {
                            axiosServices
                                .get<IUser>('/account', {
                                    maxRedirects: 0
                                })
                                .then(({ data }) => {
                                    dispatch({
                                        type: LOGIN,
                                        payload: {
                                            ...state,
                                            user: data
                                        }
                                    });

                                    if (data.select_company_required && data.companies.length === 0) {
                                        navigate('/select-organization');
                                    } else {
                                        resolve(data);
                                    }
                                });
                        })
                        .catch((error) => {
                            reject(error);
                        });
                })
                .catch((error) => {
                    reject(error);
                });
        });

    const logout = () => {
        signOut().then(() => {
            dispatch({ type: LOGOUT });
        });
    };

    const changeCompanyContext = (companyId: number): Promise<any> =>
        new Promise((resolve, reject) => {
            axiosServices
                .post(
                    '/account/change-company',
                    {
                        company_id: companyId
                    },
                    {
                        maxRedirects: 0
                    }
                )
                .then(() => {
                    axiosServices
                        .get<IUser>('/account', {
                            maxRedirects: 0
                        })
                        .then(({ data }) => {
                            dispatch({
                                type: LOGIN,
                                payload: {
                                    ...state,
                                    user: data
                                }
                            });
                            resolve(data);
                        });
                })
                .catch((error) => {
                    reject(error);
                });
        });

    const checkAuthentication = async (): Promise<void> => {
        try {
            const { data } = await axiosServices.get<IUser>('/account', {
                maxRedirects: 0
            });

            dispatch({
                type: ACCOUNT_INITIALIZE,
                payload: {
                    ...state,
                    isLoggedIn: true,
                    user: data
                }
            });

            if (data.select_company_required && data.companies.length === 0) navigate('/select-organization');
        } catch (error) {
            dispatch({
                type: ACCOUNT_INITIALIZE,
                payload: {
                    ...state,
                    isLoggedIn: false,
                    user: null
                }
            });
        }
    };
    //
    useEffect(() => {
        if (!location.pathname.includes(config.publicPath)) {
            checkAuthentication().then(() => {});
        }
    }, []);

    if (!location.pathname.includes(config.publicPath) && !state.isInitialized) {
        return <Loader />;
    }

    return (
        <SanctumContext.Provider value={{ ...state, login, logout, register, changeCompanyContext, checkAuthentication }}>
            {children}
        </SanctumContext.Provider>
    );
};

export default SanctumContext;
