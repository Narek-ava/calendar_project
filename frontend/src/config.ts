import { PaletteMode } from '@material-ui/core';

// Generate User's token
// docker-compose run api-php-cli php artisan tinker
// App\Models\User::find(1)->createToken('test')->plainTextToken

const config: {
    apiUrl: string | undefined;
    basename: string;
    defaultPath: string;
    publicPath: string;
    fontFamily: string;
    borderRadius: number;
    outlinedFilled: boolean;
    theme: PaletteMode;
    presetColor: string;
    i18n: string;
    rtlLayout: boolean;
} = {
    // basename: only at build time to set, and Don&apos;t add '/' at end off BASENAME for breadcrumbs, also Don&apos;t put only '/' use blank('') instead,
    // like '/berry-material-react/react/default'
    apiUrl: process.env.REACT_APP_API_URL,
    basename: '',
    defaultPath: '/calendar',
    publicPath: '/cal/',
    fontFamily: `'Roboto', sans-serif`,
    borderRadius: 12,
    outlinedFilled: true,
    theme: 'light', // light, dark
    presetColor: 'default', // default, theme1, theme2, theme3, theme4, theme5, theme6
    // 'en' - English, 'fr' - French, 'ro' - Romanian, 'zh' - Chinese
    i18n: 'en',
    rtlLayout: false
};

export default config;
