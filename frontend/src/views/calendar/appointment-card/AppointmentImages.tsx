import { useCallback, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Dialog, DialogContent, DialogTitle, Grid, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';

// project import
import Avatar from 'ui-component/extended/Avatar';
// import { Products } from 'types/e-commerce';
import { gridSpacing } from 'store/constant';

// third-party
import Slider from 'react-slick';
// import Carousel, { ViewType } from 'react-images';

// assets
import Close from '@material-ui/icons/Close';
import { ImageData } from '../../../models/IImage';
import SliderCarousel from '../../../ui-component/SliderCarousel';
import { replaceMinioToLocalhost } from '../../../utils/functions/uploading-images-helpers';

interface AppointmentImagesProps {
    matchSm: boolean;
    attachments: ImageData[];
}

// ==============================|| IMAGES ||============================== //

const AppointmentImages = ({ matchSm, attachments }: AppointmentImagesProps) => {
    const theme = useTheme();
    const matchDownLG = useMediaQuery(theme.breakpoints.up('lg'));

    const [selected, setSelected] = useState<ImageData | null>(null);
    const [modal, setModal] = useState(false);
    const [currImg, setCurrImg] = useState(0);

    const settings = {
        dots: false,
        centerMode: false,
        swipeToSlide: true,
        focusOnSelect: true,
        centerPadding: '0px',
        infinite: false,
        slidesToShow: matchSm ? 4 : attachments.length
    };

    const getLogo = useCallback((logo) => replaceMinioToLocalhost(logo ? logo?.url : ''), []);

    return (
        <>
            <Grid container alignItems="center" justifyContent="center" spacing={gridSpacing}>
                <Grid item xs={11}>
                    <Slider {...settings}>
                        {attachments.map((item, index) => (
                            <Box
                                key={index}
                                onClick={() => {
                                    setSelected(item);
                                    setCurrImg(index);
                                    setModal(!modal);
                                }}
                                sx={{ p: 1 }}
                            >
                                <Avatar
                                    outline={selected === item}
                                    size={matchDownLG ? 'lg' : 'md'}
                                    color="primary"
                                    src={getLogo(item)}
                                    variant="rounded"
                                    sx={{ m: '0 auto', cursor: 'pointer' }}
                                />
                            </Box>
                        ))}
                    </Slider>
                </Grid>
            </Grid>
            {modal ? (
                <Dialog
                    fullWidth
                    fullScreen
                    open={modal}
                    onClose={() => setModal(!modal)}
                    aria-labelledby="responsive-dialog-title"
                    sx={{
                        backgroundColor: '#000',
                        '& .MuiPaper-root': {
                            p: 0
                        }
                    }}
                >
                    <DialogTitle
                        sx={{
                            p: '8px 24px',
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.getContrastText(theme.palette.primary.main)
                        }}
                    >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>Appointment Attachments:</Typography>
                            <IconButton onClick={() => setModal(!modal)}>
                                <Close sx={{ color: theme.palette.getContrastText(theme.palette.primary.main) }} />
                            </IconButton>
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, backgroundColor: '#000' }}>
                        <SliderCarousel
                            matchSm={matchSm}
                            images={attachments.map((attachment) => getLogo(attachment))}
                            selectedItem={currImg}
                        />
                    </DialogContent>
                </Dialog>
            ) : null}
        </>
    );
};

export default AppointmentImages;
