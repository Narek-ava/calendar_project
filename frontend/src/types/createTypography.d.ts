import * as createTypography from '@material-ui/core/styles/createTypography';

declare module '@material-ui/core/styles/createTypography' {
    export interface FontStyle
        extends Required<{
            textTransform: TextTransform;
            fontSize: string | number; // added string
        }> {}
    export interface FontStyleOptions extends Partial<FontStyle> {
        fontSize?: string | number; // added string
    }
    export type Variant =
        | 'customInput'
        | 'mainContent'
        | 'menuCaption'
        | 'subMenuCaption'
        | 'commonAvatar'
        | 'smallAvatar'
        | 'mediumAvatar'
        | 'largeAvatar';

    export interface TypographyOptions extends Partial<Record<Variant, TypographyStyleOptions> & FontStyleOptions> {
        customInput?: TypographyStyleOptions;
        mainContent?: TypographyStyleOptions;
        menuCaption?: FontStyleOptions;
        subMenuCaption?: FontStyleOptions;
        commonAvatar?: TypographyStyleOptions;
        smallAvatar?: TypographyStyleOptions;
        mediumAvatar?: TypographyStyleOptions;
        largeAvatar?: TypographyStyleOptions;
    }

    export interface Typography extends Record<Variant, TypographyStyle>, FontStyle, TypographyUtils {
        customInput: TypographyStyle;
        mainContent: TypographyStyle;
        menuCaption: FontStyle;
        subMenuCaption: FontStyle;
        commonAvatar: TypographyStyle;
        smallAvatar: TypographyStyle;
        mediumAvatar: TypographyStyle;
        largeAvatar: TypographyStyle;
    }
}
