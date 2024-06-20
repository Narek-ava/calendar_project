import { useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme } from '@mui/material';
import { useNavigate } from 'react-router';
import { Avatar, Grid, Typography } from '@material-ui/core';
import DoneAllTwoToneIcon from '@material-ui/icons/DoneAllTwoTone';
import ClearIcon from '@material-ui/icons/Clear';

const useStyles = makeStyles((theme: Theme) => ({
    toDoRow: {
        padding: `${theme.spacing(2, 3, 2, 3)} !important`,
        borderRadius: '10px',
        cursor: 'pointer',

        '&:hover': {
            background: theme.palette.secondary.light
        }
    },
    completed: {
        color: 'white',
        background: theme.palette.success.main
    },
    uncompleted: {
        color: theme.palette.grey[200],
        background: theme.palette.grey[400]
    },
    link: {
        color: 'inherit',
        textDecoration: 'none'
    }
}));

interface ToDoRowProps {
    text: string;
    isCompleted: boolean;
    linkUrl: string;
}

const ToDoRow = ({ text, isCompleted, linkUrl }: ToDoRowProps) => {
    const classes = useStyles();
    const navigate = useNavigate();

    const handleClick = useCallback(() => {
        navigate(linkUrl);
    }, [linkUrl, navigate]);

    return (
        <Grid item xs={12} className={classes.toDoRow} onClick={handleClick}>
            <Grid container>
                <Grid item>
                    <Avatar className={isCompleted ? classes.completed : classes.uncompleted}>
                        {isCompleted ? <DoneAllTwoToneIcon /> : <ClearIcon />}
                    </Avatar>
                </Grid>
                <Grid item alignItems="center" display="flex" ml={2}>
                    <Typography variant="subtitle1">{text}</Typography>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default ToDoRow;
