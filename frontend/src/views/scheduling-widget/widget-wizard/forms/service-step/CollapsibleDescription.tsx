import { alpha, Divider, Stack } from '@mui/material';
import Transitions from '../../../../../ui-component/extended/Transitions';
import { useTheme } from '@material-ui/core/styles';
import EllipsisTypography from '../../../../../ui-component/optimized-text-fields/EllipsisTypography';

interface CollapsibleDescriptionProps {
    isOpened: boolean;
    description: string | null;
    isSelected: boolean;
}

const CollapsibleDescription = ({ description, isOpened, isSelected }: CollapsibleDescriptionProps) => {
    const theme = useTheme();

    return (
        <Transitions type="collapse" in={isOpened}>
            <Stack>
                <Divider
                    sx={{
                        // m: '0 auto',
                        // width: '70%',
                        borderStyle: 'dashed',
                        borderColor: isSelected
                            ? theme.palette.getContrastText(theme.palette.primary.main)
                            : alpha(theme.palette.primary.main, 0.5)
                    }}
                />
                <Stack direction="row" sx={{ position: 'relative' }}>
                    {/*
                    <IconInfoSquare
                        color={isSelected ? theme.palette.getContrastText(theme.palette.primary.main) : theme.palette.primary.main}
                        style={{ position: 'absolute', top: '4px', left: '12px' }}
                    />
                    */}
                    <EllipsisTypography
                        text={description}
                        sx={{
                            p: '16px 16px 16px 24px',
                            marginTop: '0 !important',
                            marginLeft: 0,
                            textIndent: '8px',
                            lineHeight: 1.6,
                            maxWidth: '100%'
                        }}
                    />
                </Stack>
            </Stack>
        </Transitions>
    );
};

export default CollapsibleDescription;
