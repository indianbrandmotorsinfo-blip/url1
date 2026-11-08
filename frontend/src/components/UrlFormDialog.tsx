import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { errorMessage } from '../api/client';
import type { UrlInput, UrlItem } from '../api/types';
import { isValidHttpUrl, normalizeUrl } from '../utils/urls';

const NAME_MAX = 80;
const DESCRIPTION_MAX = 160;

type FieldErrors = Partial<Record<keyof UrlInput, string>>;

function validate(values: UrlInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name) {
    errors.name = 'Enter an application name.';
  } else if (values.name.length > NAME_MAX) {
    errors.name = `Use ${NAME_MAX} characters or fewer.`;
  }
  if (!values.url) {
    errors.url = 'Enter a URL.';
  } else if (!isValidHttpUrl(values.url)) {
    errors.url = 'Enter a valid web address, like https://github.com.';
  }
  if (!values.description) {
    errors.description = 'Add a short description.';
  } else if (values.description.length > DESCRIPTION_MAX) {
    errors.description = `Use ${DESCRIPTION_MAX} characters or fewer.`;
  }
  return errors;
}

interface Props {
  open: boolean;
  /** The link being edited, or null when adding a new one. */
  item: UrlItem | null;
  onClose: () => void;
  onSubmit: (input: UrlInput) => Promise<void>;
}

export function UrlFormDialog({ open, item, onClose, onSubmit }: Props) {
  const [name, setName] = useState(item?.name ?? '');
  const [url, setUrl] = useState(item?.url ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const clearError = (field: keyof UrlInput) => setErrors((current) => ({ ...current, [field]: undefined }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) {
      return;
    }
    const values: UrlInput = {
      name: name.trim(),
      url: normalizeUrl(url),
      description: description.trim(),
    };
    const found = validate(values);
    setErrors(found);
    setServerError(null);
    if (Object.keys(found).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (caught) {
      setServerError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ pt: 4, px: { xs: 3, sm: 4 } }}>
          <Typography variant="h2">{item ? 'Edit URL' : 'Add URL'}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
            {item ? 'Update how this link appears on your page.' : 'Save a link to your page.'}
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
              {serverError}
            </Alert>
          )}

          <Box sx={{ display: 'grid', gap: 2.5 }}>
            <TextField
              label="Application name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearError('name');
              }}
              error={Boolean(errors.name)}
              helperText={errors.name}
              autoFocus
              required
            />
            <TextField
              label="URL"
              placeholder="https://"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                clearError('url');
              }}
              error={Boolean(errors.url)}
              helperText={errors.url}
              autoComplete="off"
              required
            />
            <TextField
              label="Short description"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                clearError('description');
              }}
              error={Boolean(errors.description)}
              helperText={errors.description ?? `${description.length}/${DESCRIPTION_MAX}`}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 3, sm: 4 }, pb: 4, pt: 1, gap: 1 }}>
          <Button color="inherit" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
