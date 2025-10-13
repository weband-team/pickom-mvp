'use client';

import { useState } from 'react';
import { Box, Typography, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface EditableDescriptionProps {
  description?: string;
  onSave?: (newDescription: string) => void;
}

export function EditableDescription({ description = '', onSave }: EditableDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(description);

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(description);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(description);
    setIsEditing(false);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          About
        </Typography>

        {!isEditing ? (
          <IconButton onClick={handleEdit} size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleSave} size="small" color="primary">
              <SaveIcon fontSize="small" />
            </IconButton>
            <IconButton onClick={handleCancel} size="small">
              <CancelIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {isEditing ? (
        <TextField
          multiline
          rows={4}
          fullWidth
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="Tell others about yourself..."
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#fafafa',
            },
          }}
        />
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {description || 'No description provided.'}
        </Typography>
      )}
    </Box>
  );
}