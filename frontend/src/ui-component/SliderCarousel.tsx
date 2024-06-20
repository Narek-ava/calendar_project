import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface SliderCarouselProps {
    images: string[];
    selectedItem: number;
    matchSm: boolean;
}

const SliderCarousel = ({ images, selectedItem, matchSm }: SliderCarouselProps) => {
    const theme = useTheme();
    const offset = matchSm ? '160px' : '200px';
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: '100vw',
                width: '100%',
                height: `calc(100vh - ${offset})`,

                '& .carousel-root .carousel-slider': {
                    width: '100vw !important',
                    height: '100%'
                },
                '& .slide': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                '& .slider-wrapper': {
                    height: 'unset !important'
                },
                '& .thumbs-wrapper': {
                    margin: '0 !important',
                    position: 'fixed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bottom: 0,
                    right: 0,
                    left: 0,
                    padding: '16px',
                    backgroundColor: '#000',
                    '& > button': {
                        display: 'none'
                    }
                },
                '& .thumbs': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'none !important',
                    padding: 0
                },
                '& .control-dots': {
                    display: 'none'
                },
                '& .thumb': {
                    height: matchSm ? '60px' : '80px',
                    width: matchSm ? '60px !important' : '80px !important',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    '& > img': {
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                    }
                },
                '& .thumb.selected': {
                    border: `3px solid ${theme.palette.primary.light} !important`
                },
                '& .thumb:hover': {
                    border: `3px solid ${theme.palette.primary.light} !important`
                }
            }}
        >
            <Carousel
                autoFocus
                emulateTouch
                showThumbs
                showStatus={false}
                useKeyboardArrows
                // transitionTime={1000}
                selectedItem={selectedItem}
                // width="600px"
            >
                {images.map((image) => (
                    <Box
                        key={image}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            maxWidth: '100vw',
                            // width: '100%',
                            // height: 'calc(100vh - 200px)',
                            overflow: 'hidden',
                            '& > img': {
                                maxHeight: `calc(100vh - ${offset})`,
                                maxWidth: '100%',
                                objectFit: 'contain',
                                objectPosition: 'center',
                                borderRadius: '4px',

                                '&.carousel-image': {
                                    pointerEvents: 'auto'
                                }
                            }
                        }}
                    >
                        <img src={image} alt="" className="carousel-image" />
                    </Box>
                ))}
            </Carousel>
        </Box>
    );
};

export default SliderCarousel;
