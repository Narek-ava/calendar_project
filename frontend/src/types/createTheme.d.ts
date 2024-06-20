import * as createTheme from '@material-ui/core/styles/createTheme';
import { customShadows } from 'themes/shadows';

declare module '@material-ui/core/styles/createTheme' {
    export interface ThemeOptions {
        customShadows?: customShadows;
        customization?: TypographyOptions | ((palette: Palette) => TypographyOptions);
        darkTextSecondary?: string;
        textDark?: string;
        darkTextPrimary?: string;
        grey500?: string;
    }
    interface Theme {
        customShadows: customShadows;
        customization: Typography;
        darkTextSecondary: string;
        textDark: string;
        grey500: string;
        darkTextPrimary: string;
    }
}
