import LinkRounded from '@mui/icons-material/LinkRounded';
import SearchOffRounded from '@mui/icons-material/SearchOffRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { INDIGO_TINT } from '../theme';

interface Props {
  variant: 'empty' | 'no-results';
  query: string;
  isAdmin: boolean;
  onAdd: () => void;
  onLogin: () => void;
  onClear: () => void;
}

export function EmptyState({ variant, query, isAdmin, onAdd, onLogin, onClear }: Props) {
  const isSearch = variant === 'no-results';

  let title = 'No applications yet';
  let body = 'Sign in as admin to add your first link.';
  let actionLabel = 'Admin Login';
  let action = onLogin;

  if (isSearch) {
    title = `Nothing matches “${query.trim()}”`;
    body = 'Try a different name or description.';
    actionLabel = 'Clear search';
    action = onClear;
  } else if (isAdmin) {
    body = 'Add your first link to see it here.';
    actionLabel = 'Add URL';
    action = onAdd;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: { xs: 8, md: 12 }, px: 2 }}>
      <Box
        aria-hidden
        sx={{ width: 56, height: 56, display: 'grid', placeItems: 'center', borderRadius: '16px', bgcolor: INDIGO_TINT, color: 'primary.main', mb: 2.5 }}
      >
        {isSearch ? <SearchOffRounded /> : <LinkRounded sx={{ transform: 'rotate(-45deg)' }} />}
      </Box>
      <Typography variant="h2" sx={{ overflowWrap: 'anywhere' }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
        {body}
      </Typography>
      <Button variant={isSearch ? 'outlined' : 'contained'} onClick={action}>
        {actionLabel}
      </Button>
    </Box>
  );
}
