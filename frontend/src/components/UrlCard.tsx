import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import EditOutlined from '@mui/icons-material/EditOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { UrlItem } from '../api/types';
import { INDIGO_TINT } from '../theme';
import { monogram } from '../utils/urls';

interface Props {
  item: UrlItem;
  isAdmin: boolean;
  onEdit: (item: UrlItem) => void;
  onDelete: (item: UrlItem) => void;
}

export function UrlCard({ item, isAdmin, onEdit, onDelete }: Props) {
  return (
    <Box
      component="article"
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        p: 2.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        boxShadow: '0 1px 2px rgba(16,24,40,0.04)',
        cursor: 'pointer',
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: '#D3D8E6',
          boxShadow: '0 14px 30px -10px rgba(16,24,40,0.16), 0 2px 6px rgba(16,24,40,0.05)',
        },
        '&:hover .card-title': { color: 'primary.main' },
        '&:hover .card-arrow': { opacity: 1, transform: 'none' },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'box-shadow 200ms ease',
          '&:hover': { transform: 'none' },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box
          aria-hidden
          sx={{
            width: 40,
            height: 40,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '12px',
            bgcolor: INDIGO_TINT,
            color: 'primary.main',
            fontSize: 17,
            fontWeight: 700,
          }}
        >
          {monogram(item.name)}
        </Box>

        {isAdmin ? (
          <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', gap: 0.5, mt: -0.5, mr: -0.5 }}>
            <Tooltip title="Edit">
              <IconButton size="small" aria-label={`Edit ${item.name}`} onClick={() => onEdit(item)}>
                <EditOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                aria-label={`Delete ${item.name}`}
                onClick={() => onDelete(item)}
              >
                <DeleteOutlineRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <ArrowOutwardRounded
            className="card-arrow"
            aria-hidden
            sx={{
              fontSize: 20,
              color: 'text.secondary',
              opacity: 0,
              transform: 'translate(-4px, 4px)',
              transition: 'opacity 200ms ease, transform 200ms ease',
            }}
          />
        )}
      </Box>

      <Link
        className="card-title"
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        underline="none"
        sx={{
          display: 'block',
          fontSize: 17,
          fontWeight: 650,
          letterSpacing: '-0.015em',
          lineHeight: 1.3,
          color: 'text.primary',
          overflowWrap: 'anywhere',
          transition: 'color 200ms ease',
          // Stretches the link over the whole card so the entire card opens the URL.
          '&::after': { content: '""', position: 'absolute', inset: 0, zIndex: 1, borderRadius: '16px' },
          '&:focus-visible': { outline: 'none' },
          '&:focus-visible::after': { outline: '2px solid #4F46E5', outlineOffset: '2px' },
        }}
      >
        {item.name}
      </Link>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mt: 0.75,
          minHeight: '3.1em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          overflowWrap: 'anywhere',
        }}
      >
        {item.description}
      </Typography>
    </Box>
  );
}
