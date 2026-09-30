'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearToast } from '@/store/slices/uiSlice';

export default function Toast() {
  const dispatch = useDispatch();
  const toast = useSelector((s) => s.ui.toast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch(clearToast(toast.id)), toast.duration);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  return (
    <div id="toast" className={toast ? 'show' : ''}>
      {toast?.message}
    </div>
  );
}