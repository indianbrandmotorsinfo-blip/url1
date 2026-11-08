import AddRounded from '@mui/icons-material/AddRounded';
import LockOutlined from '@mui/icons-material/LockOutlined';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { LogoMark } from './LogoMark';
import { SearchBox } from './SearchBox';

interface Props {
  query: string;
  onQueryChange: (value: string) => void;
  isAdmin: boolean;
  onLoginClick: () => void;
  onAddClick: () => void;
  onLogout: () => void;
}

export function TopBar({ query, onQueryChange, isAdmin, onLoginClick, onAddClick, onLogout }: Props) {
  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'saturate(180%) blur(18px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            alignItems: 'center',
            columnGap: 2,
            rowGap: 1.5,
            py: { xs: 1.5, md: 0 },
            minHeight: { md: 72 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: { md: '0 0 260px' } }}>
            <LogoMark />
            <Typography component="span" sx={{ fontSize: 17, fontWeight: 650, letterSpacing: '-0.02em' }}>
              URL Management
            </Typography>
          </Box>

          <Box
            sx={{
              order: { xs: 3, md: 0 },
              flex: { xs: '1 1 100%', md: '1 1 auto' },
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <SearchBox value={query} onChange={onQueryChange} />
          </Box>

          <Box
            sx={{
              ml: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 1,
              flex: { md: '0 0 260px' },
            }}
          >
            {isAdmin ? (
              <>
                <Button variant="contained" startIcon={<AddRounded />} onClick={onAddClick}>
                  Add URL
                </Button>
                <Tooltip title="Sign out">
                  <IconButton aria-label="Sign out" onClick={onLogout}>
                    <LogoutRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<LockOutlined fontSize="small" />}
                onClick={onLoginClick}
                sx={{ borderColor: 'divider', bgcolor: '#FFFFFF', '&:hover': { borderColor: '#C3C8D6' } }}
              >
                Admin Login
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
