import React from 'react';

// material-ui
import { makeStyles } from '@material-ui/styles';
import { useTheme, Theme } from '@material-ui/core/styles';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';

// assets
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// style constant
const useStyles = makeStyles((theme: Theme) => ({
    root: {
        width: '100%'
    },
    heading: {
        fontSize: theme.typography?.pxToRem(15)!,
        fontWeight: theme.typography?.fontWeightRegular!
    }
}));

// ==============================|| ACCORDION ||============================== //

type AccordionItem = {
    id: string;
    title: React.ReactElement | string;
    content: React.ReactElement | string;
    disabled?: boolean;
    expanded?: boolean;
    defaultExpand?: boolean | undefined;
};

export interface accordionProps {
    data: AccordionItem[];
    defaultExpandedId?: string | boolean | null;
    expandIcon?: React.ReactElement;
    square?: boolean;
    toggle?: boolean;
}

const Accordion = ({ data, defaultExpandedId = null, expandIcon, square, toggle }: accordionProps) => {
    const classes = useStyles();
    const theme = useTheme();

    const [expanded, setExpanded] = React.useState<string | boolean | null>(null);

    const handleChange = (panel: string) => (event: React.SyntheticEvent<Element, Event>, newExpanded: boolean) => {
        toggle && setExpanded(newExpanded ? panel : false);
    };

    React.useEffect(() => {
        setExpanded(defaultExpandedId);
    }, [defaultExpandedId]);

    return (
        <div className={classes.root}>
            {data &&
                data.map((item: AccordionItem) => (
                    <MuiAccordion
                        key={item.id}
                        defaultExpanded={!item.disabled && item.defaultExpand}
                        expanded={(!toggle && !item.disabled && item.expanded) || (toggle && expanded === item.id)}
                        disabled={item.disabled}
                        square={square}
                        onChange={handleChange(item.id)}
                    >
                        <MuiAccordionSummary
                            expandIcon={expandIcon || expandIcon === false ? expandIcon : <ExpandMoreIcon />}
                            sx={{ color: theme.palette.mode === 'dark' ? 'grey.500' : 'grey.800', fontWeight: 500 }}
                        >
                            {item.title}
                        </MuiAccordionSummary>
                        <MuiAccordionDetails>{item.content}</MuiAccordionDetails>
                    </MuiAccordion>
                ))}
        </div>
    );
};

export default Accordion;
