'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  TextField,
  Rating
} from '@mui/material';
import { Button } from '../ui';
import { Star } from '@mui/icons-material';

interface ReviewDialogProps {
  open: boolean;
  pickerName: string;
  onSubmit: (rating: number, comment: string) => void;
  onCancel: () => void;
}

export function ReviewDialog({
  open,
  pickerName,
  onSubmit,
  onCancel
}: ReviewDialogProps) {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const handleSubmit = () => {
    onSubmit(rating, comment);
    setRating(5);
    setComment('');
  };

  const handleCancel = () => {
    onCancel();
    setRating(5);
    setComment('');
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6">Leave a Review</Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          How was your experience with <strong>{pickerName}</strong>?
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Rating
          </Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => {
              if (newValue !== null) {
                setRating(newValue);
              }
            }}
            size="large"
            icon={<Star fontSize="inherit" />}
            emptyIcon={<Star fontSize="inherit" />}
          />
        </Box>

        <Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Comment (optional)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            variant="outlined"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          fullWidth
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth
        >
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>
  );
}
