import { useState } from 'react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { mutabaahService } from '../../services/mutabaahService'

export default function Takhasus() {
  const [form, setForm] = useState({
    materi_bacaan: '',
    rentang_bacaan: '',
    tanggal: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await mutabaahService.create({ 
        ...form, 
        jenis_mutabaah: 'TAKHASUS' 
      })
      
      toast.success('Data Mutabaah Takhasus berhasil disimpan!')
      setForm({ ...form, materi_bacaan: '', rentang_bacaan: '' }) 
    } catch (err) {
      toast.error('Gagal menyimpan data mutabaah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader 
        title="Mutabaah Takhasus" 
        subtitle="Catat perkembangan bacaan Iqro' mentee" 
      />

      <div className="mt-6 max-w-2xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <Input
            label="Tanggal Pertemuan"
            type="date"
            value={form.tanggal}
            onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
            required
          />

          {/* Label disesuaikan khusus untuk Iqro */}
          <Input
            label="Jilid Iqro'"
            placeholder="Contoh: Iqro Jilid 3"
            value={form.materi_bacaan}
            onChange={(e) => setForm({ ...form, materi_bacaan: e.target.value })}
            required
          />

          <Input
            label="Halaman"
            placeholder="Contoh: Halaman 12-15"
            value={form.rentang_bacaan}
            onChange={(e) => setForm({ ...form, rentang_bacaan: e.target.value })}
            required
          />

          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full sm:w-auto">
              Simpan Mutabaah
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}