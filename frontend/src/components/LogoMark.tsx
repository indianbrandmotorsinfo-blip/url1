import LinkRounded from '@mui/icons-material/LinkRounded';
import Box from '@mui/material/Box';

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        color: '#FFFFFF',
        borderRadius: `${Math.round(size * 0.3)}px`,
        background: 'linear-gradient(145deg, #6366F1, #4338CA)',
        boxShadow: '0 1px 2px rgba(67,56,202,0.4), inset 0 1px 0 rgba(255,255,255,0.25)',
      }}
    >
      <LinkRounded sx={{ fontSize: size * 0.56, transform: 'rotate(-45deg)' }} />
    </Box>
  );
}
