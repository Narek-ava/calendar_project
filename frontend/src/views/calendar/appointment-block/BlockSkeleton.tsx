import { Skeleton, Stack } from '@material-ui/core';

const BlockSkeleton = () => (
    <>
        <Stack sx={{ width: '100%' }}>
            {Array.from(Array(4).keys()).map((i) => (
                <Skeleton
                    key={i}
                    animation="wave"
                    variant="rectangular"
                    height={i === 3 ? 80 : 40}
                    sx={{ bgcolor: 'grey.300', mb: 2, mx: 2, borderRadius: '8px' }}
                />
            ))}
        </Stack>
        <Stack sx={{ width: '100%' }}>
            <Skeleton animation="wave" variant="rectangular" height={40} sx={{ bgcolor: 'grey.300', mx: 2, borderRadius: '8px' }} />
        </Stack>
    </>
);

export default BlockSkeleton;
