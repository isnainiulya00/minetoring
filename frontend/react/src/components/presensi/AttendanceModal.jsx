import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '../common/Modal'
import Button from '../common/Button'
import { PRESENSI_STATUS } from '../../utils/constants'
import { presensiService } from '../../services/presensiService'
import { mediaUrl } from '../../utils/mediaUrl'

const STATUSES = ['HADIR', 'IZIN', 'SAKIT', 'ALPHA']

export default function AttendanceModal({ open, onClose, presensiRow, onSaved }) {
  const [status, setStatus] = useState('HADIR')
  const [surat, setSurat] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (presensiRow) setStatus(presensiRow.status || 'ALPHA')
    setSurat(null)
  }, [presensiRow])

  const handleSave = async () => {
    if (status === 'IZIN' && !surat && !presensiRow?.surat_izin_url) {
      toast.error('Upload surat izin wajib untuk status Izin')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('status', status)
      if (surat) fd.append('surat_izin', surat)
      await presensiService.update(presensiRow.id, fd)
      toast.success('Presensi disimpan')
      onSaved?.()
      onClose()
    } catch {
      toast.error('Gagal menyimpan presensi')
    } finally {
      setSaving(false)
    }
  }

  if (!presensiRow) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Presensi — ${presensiRow.mentee_nama || 'Mentee'}`}
      subtitle={`Pertemuan ke-${presensiRow.pertemuan_ke}`}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Pilih status kehadiran:</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STATUSES.map((s) => {
            const meta = PRESENSI_STATUS[s] || { label: s }
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  status === s
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {meta.label}
              </button>
            )
          })}
        </div>

        {status === 'IZIN' && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
            <label className="block text-sm font-medium text-gray-700">Surat izin (PDF/gambar)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="mt-2 block w-full text-sm"
              onChange={(e) => setSurat(e.target.files?.[0] || null)}
            />
            {presensiRow.surat_izin_url && !surat && (
              <a
                href={mediaUrl(presensiRow.surat_izin_url)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-gray-600 underline"
              >
                Lihat surat izin sebelumnya
              </a>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
