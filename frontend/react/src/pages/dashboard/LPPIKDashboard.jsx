import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import axios from 'axios' // Sesuaikan jika kamu punya custom instance seperti '../../api/axios'

export default function LPPIKDashboard() {
  // 1. State untuk menampung data asli dari database
  const [stats, setStats] = useState({
    totalMentee: 0,
    totalMentor: 0,
    totalHalaqah: 0,
    rataHafalan: 0
  })
  const [progresTerbaru, setProgresTerbaru] = useState([])
  const [loading, setLoading] = useState(true)

  // 2. Ambil data asli saat halaman dibuka
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true)

        // 📝 CATATAN: Ganti URL ini dengan URL API yang dipakai oleh Dashboard KMF kamu beneran
        // Karena datanya mau disamakan, otomatis endpoint-nya disamakan saja
        const response = await axios.get('http://127.0.0.1:8000/api/dashboard/kmf-summary/') 
        
        const dataAsli = response.data

        // 3. Masukkan data dari Django ke dalam State (Sesuaikan nama field dari serializer Django-mu)
        setStats({
          totalMentee: dataAsli.total_mentee || 0,
          totalMentor: dataAsli.total_mentor || 0,
          totalHalaqah: dataAsli.total_halaqah || 0,
          rataHafalan: dataAsli.rata_hafalan || 0
        })

        setProgresTerbaru(dataAsli.progres_halaqah || [])
      } catch (error) {
        console.error("Error ambil data asli:", error)
        toast.error("Gagal menyinkronkan data dari server")
      } finally {
        setLoading(false)
      }
    }

    fetchRealData()
  }, [])

  // 4. Loading State biar user tahu data asli sedang ditarik
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
        <span className="ml-3 text-sm font-medium text-gray-500">Menyinkronkan data real-time...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard LPPIK" 
        subtitle="Sistem Informasi Pemantauan Progres Mentoring AIK" 
      />

      {/* ─── KARTU STATISTIK DATA ASLI ─── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm font-medium text-gray-500">Total Mentee</p>
          <p className="mt-2 font-display text-4xl font-bold text-gray-900">{stats.totalMentee}</p>
        </Card>
        
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm font-medium text-gray-500">Total Mentor</p>
          <p className="mt-2 font-display text-4xl font-bold text-gray-900">{stats.totalMentor}</p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm font-medium text-gray-500">Kelompok Halaqah</p>
          <p className="mt-2 font-display text-4xl font-bold text-blue-600">{stats.totalHalaqah}</p>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center bg-emerald-50 border-emerald-100">
          <p className="text-sm font-medium text-emerald-600">Rata-rata Hafalan</p>
          <p className="mt-2 font-display text-4xl font-bold text-emerald-700">{stats.rataHafalan}%</p>
        </Card>
      </div>

      {/* ─── TABEL PEMANTAUAN DATA ASLI ─── */}
      <Card>
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-gray-900">Pantauan Progres Halaqah</h2>
            <p className="text-sm text-gray-500">Rekapitulasi pencapaian hafalan per kelompok</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 font-medium">Nama Kelompok</th>
                <th className="p-4 font-medium">Mentor</th>
                <th className="p-4 font-medium">Progres Hafalan</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {progresTerbaru.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">Belum ada data progres kelompok masuk.</td>
                </tr>
              ) : (
                progresTerbaru.map((item, index) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={index} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-medium text-gray-900">{item.nama_kelompok}</td>
                    <td className="p-4 text-gray-600">{item.nama_mentor}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-full max-w-[120px] rounded-full bg-gray-200">
                          <div 
                            className={`h-2.5 rounded-full ${item.progres < 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${item.progres}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-600">{item.progres}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={item.progres < 70 ? 'warning' : 'success'}>
                        {item.progres < 70 ? 'Perlu Dipacu' : 'Berjalan Baik'}
                      </Badge>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}