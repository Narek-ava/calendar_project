import React, { useCallback } from 'react';
import { createTheme, ThemeProvider, useTheme } from '@material-ui/core/styles';
import { WidgetBgPatterns, IWidgetSettings } from '../../models/ICompany';

interface WidgetThemeProviderProps {
    children: React.ReactNode;
    styles?: IWidgetSettings;
}

const WidgetThemeProvider = ({ children, styles }: WidgetThemeProviderProps) => {
    const theme = useTheme();

    const changeColor = useCallback((color: string, amount: number) => {
        const clamp = (val: number) => Math.min(Math.max(val, 0), 0xff);
        const fill = (str: string) => `00${str}`.slice(-2);

        const num = parseInt(color.substr(1), 16);
        /* eslint-disable no-bitwise */
        const red = clamp((num >> 16) + amount);
        const green = clamp(((num >> 8) & 0x00ff) + amount);
        const blue = clamp((num & 0x0000ff) + amount);
        /* eslint-enable no-bitwise */
        return `#${fill(red.toString(16))}${fill(green.toString(16))}${fill(blue.toString(16))}`;
    }, []);

    const widgetTheme = createTheme({
        ...theme,
        palette: {
            ...theme.palette,
            widget: {
                ...theme.palette.widget,
                text: styles?.textColor || theme.palette.widget.text,
                buttonDetails: styles?.textColor ? changeColor(styles.textColor, 50) : theme.palette.widget.buttonDetails,
                green: styles?.primaryColor || theme.palette.widget.green,
                lightGreen: styles?.primaryColor || theme.palette.widget.lightGreen,
                darkGreen: styles?.primaryColor ? changeColor(styles.primaryColor, -50) : theme.palette.widget.darkGreen,
                bgTop:
                    styles?.bgPattern != null && WidgetBgPatterns[styles.bgPattern]
                        ? WidgetBgPatterns[styles.bgPattern].start
                        : theme.palette.widget.bgTop,
                bgBottom:
                    styles?.bgPattern != null && WidgetBgPatterns[styles.bgPattern]
                        ? WidgetBgPatterns[styles.bgPattern].end
                        : theme.palette.widget.bgBottom
            }
        }
    });

    return <ThemeProvider theme={widgetTheme}>{children}</ThemeProvider>;
};

export default WidgetThemeProvider;
