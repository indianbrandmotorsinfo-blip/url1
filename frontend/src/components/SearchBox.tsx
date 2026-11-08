import CloseRounded from '@mui/icons-material/CloseRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import { useEffect, useRef } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const SHORTCUT_LABEL = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘ K' : 'Ctrl K';

export function SearchBox({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <Box
      role="search"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        maxWidth: { md: 520 },
        height: 44,
        px: 1.5,
        borderRadius: '12px',
        border: '1px solid transparent',
        bgcolor: '#F1F2F6',
        transition: 'background-color 160ms, border-color 160ms, box-shadow 160ms',
        '&:hover': { bgcolor: '#ECEEF3' },
        '&:focus-within': {
          bgcolor: '#FFFFFF',
          borderColor: 'primary.main',
          boxShadow: '0 0 0 4px rgba(79,70,229,0.12)',
        },
      }}
    >
      <SearchRounded sx={{ color: 'text.secondary', fontSize: 20 }} />
      <InputBase
        inputRef={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onChange('');
          }
        }}
        placeholder="Search applications"
        inputProps={{ 'aria-label': 'Search applications', autoComplete: 'off', spellCheck: false }}
        sx={{ flex: 1, fontSize: 15 }}
      />
      {value ? (
        <IconButton size="small" aria-label="Clear search" onClick={() => onChange('')} edge="end">
          <CloseRounded sx={{ fontSize: 18 }} />
        </IconButton>
      ) : (
        <Box
          component="kbd"
          aria-hidden
          sx={{
            display: { xs: 'none', md: 'block' },
            px: 0.9,
            py: 0.25,
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 500,
            color: 'text.secondary',
            bgcolor: '#FFFFFF',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
          }}
        >
          {SHORTCUT_LABEL}
        </Box>
      )}
    </Box>
  );
}
