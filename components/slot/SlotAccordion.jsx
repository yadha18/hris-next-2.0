'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import useAdminGuard from '@/hooks/useAdminGuard';
import PasswordModal from '../modals/PasswordModal';
import EditSlotModal from './EditSlotModal';

export default function SlotAccordion() {
  const slotConfig = useSelector((s) => s.hris.slotConfig);
  const [openSBU, setOpenSBU] = useState(null);
  const [editSBU, setEditSBU] = useState(null);
  const guard = useAdminGuard();

  return (
    <div className="page active">
      <div className="page-header"><h1>📐 Slot Jabatan per SBU</h1></div>
      <div className="slot-accordion">
        {Object.entries(slotConfig).map(([sbu, detail]) => (
          <div key={sbu} className="slot-accordion-item">
            <div className="slot-accordion-header">
              <div className="slot-accordion-clickzone" onClick={() => setOpenSBU(openSBU === sbu ? null : sbu)}>
                <span className={`slot-accordion-arrow ${openSBU === sbu ? 'open' : ''}`}>▶</span>
                <span className="slot-accordion-title">{sbu}</span>
                <span className="slot-accordion-stats"><strong>{detail.total}</strong> slot fix</span>
              </div>
              <button className="btn btn-secondary btn-sm slot-edit-btn" onClick={() => guard.requestAccess(() => setEditSBU(sbu))}>✏️ Edit</button>
            </div>
            {openSBU === sbu && (
              <div className="slot-accordion-body">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Jabatan</th><th>Slot Fix</th></tr></thead>
                    <tbody>
                      {Object.entries(detail.jabatan).map(([jab, val]) => (
                        <tr key={jab}><td>{jab}</td><td>{val}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {guard.modalOpen && <PasswordModal error={guard.error} onSubmit={guard.submit} onClose={guard.cancel} />}
      {editSBU && <EditSlotModal sbu={editSBU} onClose={() => setEditSBU(null)} />}
    </div>
  );
}