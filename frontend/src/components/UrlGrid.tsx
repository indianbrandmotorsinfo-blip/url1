import { keyframes } from '@emotion/react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import type { UrlItem } from '../api/types';
import { UrlCard } from './UrlCard';

const reveal = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
`;

const gridSx = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 2.5,
} as const;

interface Props {
  items: UrlItem[];
  isAdmin: boolean;
  onEdit: (item: UrlItem) => void;
  onDelete: (item: UrlItem) => void;
}

export function UrlGrid({ items, isAdmin, onEdit, onDelete }: Props) {
  return (
    <Box
      sx={{
        ...gridSx,
        animation: `${reveal} 380ms cubic-bezier(0.2, 0.7, 0.2, 1) both`,
        '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
      }}
    >
      {items.map((item) => (
        <UrlCard key={item.id} item={item} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </Box>
  );
}

export function UrlGridSkeleton() {
  return (
    <Box sx={gridSx} aria-busy="true" aria-label="Loading applications">
      {Array.from({ length: 6 }, (_, index) => (
        <Box
          key={index}
          sx={{ p: 2.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}
        >
          <Skeleton variant="rounded" width={40} height={40} sx={{ mb: 2, borderRadius: '12px' }} />
          <Skeleton width="55%" height={26} />
          <Skeleton width="85%" />
        </Box>
      ))}
    </Box>
  );
}
