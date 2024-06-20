import { Skeleton, Stack } from '@material-ui/core';

const CardSkeleton = () => (
    <>
        <Stack sx={{ width: '100%' }}>
            <Skeleton animation="wave" variant="rectangular" height={60} sx={{ bgcolor: 'grey.300', mb: 3, mx: 2, borderRadius: '8px' }} />
        </Stack>
        <Stack sx={{ width: '100%' }}>
            {Array.from(Array(7).keys()).map((i) => (
                <Skeleton
                    key={i}
                    animation="wave"
                    variant="rectangular"
                    height={i === 5 ? 80 : 40}
                    sx={{ bgcolor: 'grey.300', mb: 3, mx: 2, borderRadius: '8px' }}
                />
            ))}
        </Stack>
        <Stack sx={{ width: '100%' }}>
            <Skeleton animation="wave" variant="rectangular" height={80} sx={{ bgcolor: 'grey.300', mb: 3, mx: 2, borderRadius: '8px' }} />
        </Stack>
    </>
);

export default CardSkeleton;
