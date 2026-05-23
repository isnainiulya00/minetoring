import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { informasiService } from '../../services/informasiService'

export default function InformasiForm() {
  const navigate = useNavigate()
  const [judul, setJudul] = useState('')
  const [isi, setIsi] = useState('')
  const [poster, setPoster] = useState(null) // State untuk file gambar
  const [loading, setLoading] = useState(false)
  const [tanggalKegiatan, setTanggalKegiatan] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Menggunakan FormData karena mengirim file
      const fd = new FormData()
      fd.append('judul', judul)
      fd.append('isi', isi)
      fd.append('tanggal_kegiatan', tanggalKegiatan) // Pastikan field ini sesuai dengan model Django-mu
      if (poster) fd.append('poster', poster) // Sesuaikan 'poster' dengan field model Djangomu

      await informasiService.create(fd)
      toast.success('Pengumuman beserta poster diterbitkan!')
      navigate('/informasi')
    } catch (err) {
      toast.error('Gagal menyimpan pengumuman')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader title="Buat Informasi Baru" subtitle="Sertakan poster kegiatan jika ada" />

      <Card className="mt-6 max-w-3xl" glass>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Judul Informasi" required value={judul} onChange={(e) => setJudul(e.target.value)} />
          
          
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Detail Kegiatan</label>
            <textarea
              required rows="5"
              value={isi} onChange={(e) => setIsi(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal Kegiatan</label>
            <input
              type="date"
              value={tanggalKegiatan}
              onChange={(e) => setTanggalKegiatan(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 outline-none transition bg-white"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Upload Poster (Opsional)</label>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => setPoster(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
            />
            {poster && <p className="text-xs text-green-600 mt-2">File siap diunggah: {poster.name}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => navigate('/informasi')}>Batal</Button>
            <Button type="submit" loading={loading}>Terbitkan</Button>
          </div>
        </form>
      </Card>
    </>
  )
}