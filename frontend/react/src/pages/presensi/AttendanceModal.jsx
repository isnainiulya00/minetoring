import { useState, useEffect } from 'react'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import toast from 'react-hot-toast'
import { presensiService } from '../../services/presensiService'

export default function AttendanceModal({ open, presensiRow, onClose, onSaved, type = 'Mentor' }) {
  const [status, setStatus] = useState('ALPHA')
  const [catatan, setCatatan] = useState('')
  const [suratIzin, setSuratIzin] = useState(null) // 👈 State baru untuk file
  const [loading, setLoading] = useState(false)

  // Isi form otomatis saat modal dibuka
  useEffect(() => {
    if (open && presensiRow) {
      setStatus(presensiRow.status || 'ALPHA')
      setCatatan(presensiRow.catatan || '')
      setSuratIzin(null) // Reset file setiap kali modal dibuka
    }
  }, [open, presensiRow])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 👈 PERUBAHAN KUNCI: Kita pakai FormData karena mau kirim file
      const payload = new FormData()
      
      payload.append('jadwal', parseInt(presensiRow.jadwal))
      payload.append('status', status)
      payload.append('catatan', catatan)

      if (presensiRow.mentor) payload.append('mentor', parseInt(presensiRow.mentor))
      if (presensiRow.mentee) payload.append('mentee', parseInt(presensiRow.mentee))

      // Kalau statusnya Izin/Sakit dan ada file-nya, masukkan ke payload
      if ((status === 'IZIN' || status === 'SAKIT') && suratIzin) {
        payload.append('surat_izin', suratIzin)
      }

      // LOGIKA KUNCI: Cek dari flag isNew ATAU teks 'new' di ID
      const isNewRecord = presensiRow.isNew === true || String(presensiRow.id).includes('new')

      if (isNewRecord) {
        await presensiService.create(payload)
        toast.success(`Presensi ${type} berhasil disimpan`)
      } else {
        await presensiService.update(presensiRow.id, payload)
        toast.success(`Presensi ${type} berhasil diperbarui`)
      }

      onSaved() // Refresh tabel
      onClose() // Tutup modal
    } catch (error) {
      toast.error('Gagal menyimpan presensi. Cek formnya!')
      console.error(error.response?.data || error)
    } finally {
      setLoading(false)
    }
  }

  const statuses = ['Hadir', 'Izin', 'Sakit', 'Alpha']

  return (
    <Modal open={open} onClose={onClose} title={`Presensi — ${type}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Info Nama */}
        {presensiRow && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
            <span className="font-semibold">{presensiRow.mentor_nama || presensiRow.mentee_nama || 'Tanpa Nama'}</span> 
            {' '} — Kelompok {presensiRow.nama_kelompok}
          </div>
        )}

        <div>
          <label className="mb-3 block text-sm font-medium text-gray-700">Pilih status kehadiran:</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statuses.map(s => {
              const upperStatus = s.toUpperCase()
              const isSelected = status === upperStatus
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(upperStatus)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {/* FITUR BARU: Form Upload (Wajib Izin, Opsional Sakit) */}
        {(status === 'IZIN' || status === 'SAKIT') && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
            <label className="mb-2 block text-sm font-medium text-yellow-800">
              Upload Surat Bukti {status === 'IZIN' ? '(Wajib)' : '(Opsional)'}
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setSuratIzin(e.target.files[0])}
              className="w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-yellow-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-yellow-700 hover:file:bg-yellow-200"
              required={status === 'IZIN'} // 👈 KUNCI: Hanya wajib (required) kalau statusnya IZIN
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Masukkan keterangan tambahan..."
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 outline-none transition bg-white"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" loading={loading}>Simpan</Button>
        </div>
      </form>
    </Modal>
  )
}