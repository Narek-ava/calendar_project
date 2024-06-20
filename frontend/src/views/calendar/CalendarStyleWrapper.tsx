// material-ui
import { styled } from '@material-ui/core/styles';
import { CalendarModeValues } from './types';

const ExperimentalStyled = styled('div', { shouldForwardProp: (prop) => !!prop })<{
    cellheight: number;
    view: string;
    fetching: string;
}>(({ theme, cellheight, view, fetching }) => ({
    position: 'relative',
    '& .fc-view-harness': {
        // loading overlay
        '&:before': {
            content: '""',
            visibility: fetching === 'true' ? 'visible' : 'hidden',
            opacity: fetching === 'true' ? 1 : 0,
            transition: 'visibility 0.2s, opacity 0.2s linear',
            width: '100%',
            height: '100%',
            position: 'absolute',
            background: 'rgba(255, 255, 255, 0.4)',
            zIndex: '50'
        }
    },
    // hide license message
    '& .fc-license-message': {
        display: 'none'
    },

    '& .fc .fc-scrollgrid': {
        [theme.breakpoints.down('sm')]: {
            borderLeft: '0 !important'
        }
    },
    // basic style
    '& .fc': {
        '--fc-bg-event-opacity': 1,
        '--fc-border-color': theme.palette.divider,
        '--fc-daygrid-event-dot-width': '10px',
        '--fc-today-bg-color': theme.palette.mode === 'dark' ? theme.palette.dark[800] : theme.palette.primary.light,
        '--fc-list-event-dot-width': '10px',
        '--fc-event-border-color': theme.palette.primary.dark,
        '--fc-now-indicator-color': theme.palette.error.main,
        color: theme.palette.text.primary,
        fontFamily: theme.typography.fontFamily
    },
    // NOW INDICATOR
    '& .fc-timegrid-now-indicator-arrow': {
        border: 'none',
        borderWidth: '0 !important',
        marginTop: '0 !important',
        right: 0,
        '&::before': {
            position: 'absolute',
            content: '""',
            zIndex: 4,
            left: 0,
            borderWidth: '5.5px 0 5.5px 6px',
            borderTopColor: 'transparent !important',
            borderBottomColor: 'transparent !important',
            marginTop: '-5px',
            borderStyle: 'solid',
            borderColor: 'red'
        },
        '&::after': {
            position: 'absolute',
            content: '""',
            zIndex: 4,
            borderWidth: '1px 0 0',
            borderColor: 'red',
            borderStyle: 'solid',
            left: 0,
            right: 0
        }
    },

    // time grid slot line
    '& .fc .fc-timegrid-slot': {
        height: `${cellheight}px`
    },

    // date text
    '& .fc .fc-daygrid-day-top': {
        display: 'grid',
        '& .fc-daygrid-day-number': {
            textAlign: 'center'
        }
    },

    // month view event title
    '& .fc-daygrid-dot-event .fc-event-title': {
        overflow: 'unset'
    },

    // buttons
    '& .fc .fc-button': {
        border: 'none',
        backgroundColor: theme.palette.primary.main,

        '& .fc-icon': {
            display: 'flex'
        }
    },
    '& .fc .fc-button: hover:enabled': {
        backgroundColor: theme.palette.primary.dark
    },
    '& .fc .fc-button-group .fc-button-active': {
        backgroundColor: 'red'
    },

    '& .fc .fc-button-active: active': {
        backgroundColor: 'red'
    },

    // table head
    '& .fc .fc-col-header-cell': {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[50]
    },

    '& .fc .fc-col-header-cell-cushion': {
        color: theme.palette.grey[900]
    },

    '& .fc .fc-daygrid-day .fc-daygrid-day-number': {
        padding: '10px 0 0'
    },

    '& .fc .fc-daygrid-day: hover .fc-daygrid-day-number': {
        color: theme.palette.primary.main,
        '& span': {
            opacity: 1,
            visibility: 'visible',
            transform: 'translateX(0)'
        }
    },

    '& .fc .fc-daygrid-day-frame.fc-scrollgrid-sync-inner': {
        minHeight: '130px'
    },

    '& .fc-h-event .fc-event-time': {
        overflow: 'unset'
    },

    '& .fc-h-event .fc-event-title': {
        overflow: 'unset'
    },

    // events
    '& .fc-direction-ltr .fc-daygrid-event.fc-event-end, .fc-direction-rtl .fc-daygrid-event.fc-event-start': {
        marginRight: '2px',
        marginBottom: '1px'
    },

    '& .fc-direction-ltr .fc-daygrid-event.fc-event-start, .fc-direction-rtl .fc-daygrid-event.fc-event-end': {
        marginLeft: '2px'
    },

    '& .fc-h-event .fc-event-main': {
        paddingLeft: '2px',
        cursor: 'pointer'
    },

    // popover when multiple events
    '& .fc .fc-more-popover': {
        borderRadius: '10px'
    },

    '& .fc .fc-more-popover .fc-popover-body': {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark[800] : theme.palette.grey[200],
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px'
    },

    '& .fc .fc-popover-header': {
        padding: '16px',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark[800] : theme.palette.grey[200],
        color: theme.palette.mode === 'dark' ? theme.palette.dark.light : theme.palette.text.primary
    },

    // agenda view
    '& .fc-theme-standard .fc-list-day-cushion': {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[100]
    },

    '& .fc .fc-list-event:hover td': {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.dark[800] : theme.palette.grey[100]
    },

    '.fc-toolbar.fc-header-toolbar': {
        '& .fc-datePicker-button': {
            fontSize: '22px',
            background: 'none',
            padding: 0,
            fontWeight: 'bold',
            color:
                view === CalendarModeValues.Day || view === CalendarModeValues.ResourceDay
                    ? theme.palette.primary.main
                    : theme.palette.grey[700],
            cursor: view === CalendarModeValues.Day || view === CalendarModeValues.ResourceDay ? 'pointer' : 'default',

            '&:hover, &:active, &:focus': {
                background: 'none',
                color:
                    view === CalendarModeValues.Day || view === CalendarModeValues.ResourceDay
                        ? theme.palette.primary.main
                        : theme.palette.grey[700],
                border: 'none !important',
                outline: 'none !important',
                boxShadow: 'none !important'
            }
        }
    },

    '@media(max-width: 1280px)': {
        '.fc-toolbar.fc-header-toolbar > div:first-of-type > .fc-button-group': {
            display: 'none'
        },
        '.fc-toolbar.fc-header-toolbar > div:last-child > button': {
            // order: 2
            display: 'none'
        }
    },

    '@media(max-width: 768px)': {
        '.fc-toolbar.fc-header-toolbar': {
            fontSize: '90%',
            display: 'none'
        },

        '.fc-toolbar.fc-header-toolbar > div': {
            marginBottom: '10px'
        },

        // TODAY button
        '.fc-toolbar.fc-header-toolbar > div:first-of-type': {
            order: 2,
            justifySelf: 'flex-end'
        },
        // Date String
        '.fc-toolbar.fc-header-toolbar > div:nth-of-type(2)': {
            order: 1
        },
        '.fc-toolbar.fc-header-toolbar > div:last-child': {
            display: 'none'
        }
    }
}));

export default ExperimentalStyled;
