'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSuperadminAuthed } from '@/store/slices/uiSlice';
import { CONFIG } from '@/lib/config';

export default function useAdminGuard() {
  const dispatch = useDispatch();
  const authed = useSelector((s) => s.ui.superadminAuthed);
  const [pendingAction, setPendingAction] = useState(null);
  const [error, setError] = useState('');

  const requestAccess = (action) => {
    if (authed) return action();
    setPendingAction(() => action);
    setError('');
  };

  const submit = (password) => {
    if (password !== CONFIG.SUPERADMIN_PASSWORD) {
      setError('❌ Password salah. Coba lagi.');
      return;
    }
    dispatch(setSuperadminAuthed(true));
    const action = pendingAction;
    setPendingAction(null);
    if (action) action();
  };

  return { modalOpen: !!pendingAction, error, requestAccess, submit, cancel: () => setPendingAction(null) };
}