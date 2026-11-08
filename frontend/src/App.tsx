import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import { useDeferredValue, useMemo, useState } from 'react';
import { errorMessage, isSessionExpired } from './api/client';
import type { UrlInput, UrlItem } from './api/types';
import { useAuth } from './auth/AuthContext';
import { ConfirmDialog } from './components/ConfirmDialog';
import { EmptyState } from './components/EmptyState';
import { LoginDialog } from './components/LoginDialog';
import { TopBar } from './components/TopBar';
import { UrlFormDialog } from './components/UrlFormDialog';
import { UrlGrid, UrlGridSkeleton } from './components/UrlGrid';
import { useUrls } from './hooks/useUrls';
import { filterUrls } from './utils/urls';

interface FormState {
  open: boolean;
  item: UrlItem | null;
  /** Changes on every open so the form starts with fresh values. */
  key: number;
}

interface ConfirmState {
  open: boolean;
  item: UrlItem | null;
}

interface Toast {
  message: string;
  severity: 'success' | 'error';
}

export default function App() {
  const { isAdmin, token, login, logout } = useAuth();
  const { items, loading, error, reload, add, edit, remove } = useUrls();

  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const visible = useMemo(() => filterUrls(items, deferredQuery), [items, deferredQuery]);

  const [loginOpen, setLoginOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ open: false, item: null, key: 0 });
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false, item: null });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = (message: string, severity: Toast['severity'] = 'success') =>
    setToast({ message, severity });

  const closeForm = () => setForm((current) => ({ ...current, open: false }));
  const closeConfirm = () => setConfirm((current) => ({ ...current, open: false }));

  const expireSession = () => {
    logout();
    closeForm();
    closeConfirm();
    notify('Your session expired. Sign in again to continue.', 'error');
  };

  const openAdd = () => setForm((current) => ({ open: true, item: null, key: current.key + 1 }));
  const openEdit = (item: UrlItem) =>
    setForm((current) => ({ open: true, item, key: current.key + 1 }));
  const askDelete = (item: UrlItem) => setConfirm({ open: true, item });

  const handleLogin = async (username: string, password: string) => {
    await login(username, password);
    setLoginOpen(false);
    notify('Signed in.');
  };

  const handleSave = async (input: UrlInput) => {
    if (!token) {
      return;
    }
    try {
      if (form.item) {
        await edit(token, form.item.id, input);
        notify('Changes saved.');
      } else {
        await add(token, input);
        notify(`${input.name} added.`);
      }
      closeForm();
    } catch (caught) {
      if (isSessionExpired(caught)) {
        expireSession();
        return;
      }
      throw caught;
    }
  };

  const handleConfirmDelete = async () => {
    const target = confirm.item;
    if (!target || !token) {
      return;
    }
    setDeleting(true);
    try {
      await remove(token, target.id);
      closeConfirm();
      notify(`${target.name} deleted.`);
    } catch (caught) {
      if (isSessionExpired(caught)) {
        expireSession();
      } else {
        closeConfirm();
        notify(errorMessage(caught), 'error');
      }
    } finally {
      setDeleting(false);
    }
  };

  const searching = deferredQuery.trim().length > 0;
  let countLabel = '\u00A0';
  if (!loading && !error) {
    countLabel = searching
      ? `${visible.length} of ${items.length}`
      : `${items.length} ${items.length === 1 ? 'application' : 'applications'}`;
  }

  const renderContent = () => {
    if (loading) {
      return <UrlGridSkeleton />;
    }
    if (error) {
      return (
        <Alert
          severity="error"
          sx={{ borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => void reload()}>
              Try again
            </Button>
          }
        >
          {error}
        </Alert>
      );
    }
    if (items.length === 0 || visible.length === 0) {
      return (
        <EmptyState
          variant={items.length === 0 ? 'empty' : 'no-results'}
          query={deferredQuery}
          isAdmin={isAdmin}
          onAdd={openAdd}
          onLogin={() => setLoginOpen(true)}
          onClear={() => setQuery('')}
        />
      );
    }
    return <UrlGrid items={visible} isAdmin={isAdmin} onEdit={openEdit} onDelete={askDelete} />;
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <TopBar
        query={query}
        onQueryChange={setQuery}
        isAdmin={isAdmin}
        onLoginClick={() => setLoginOpen(true)}
        onAddClick={openAdd}
        onLogout={logout}
      />

      <Container maxWidth="xl" component="main" sx={{ py: { xs: 3, md: 5 } }}>
        <Box sx={{ mb: 3.5 }}>
          <Typography variant="h1" component="h1">
            Applications
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }} aria-live="polite">
            {countLabel}
          </Typography>
        </Box>
        {renderContent()}
      </Container>

      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} onSubmit={handleLogin} />
      <UrlFormDialog key={form.key} open={form.open} item={form.item} onClose={closeForm} onSubmit={handleSave} />
      <ConfirmDialog
        open={confirm.open}
        title="Delete this URL?"
        message={confirm.item ? `${confirm.item.name} will be removed from your page. This can’t be undone.` : ''}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onClose={closeConfirm}
      />

      {toast && (
        <Snackbar
          open
          autoHideDuration={4000}
          onClose={(_event, reason) => {
            if (reason !== 'clickaway') {
              setToast(null);
            }
          }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: '12px' }}>
            {toast.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}
