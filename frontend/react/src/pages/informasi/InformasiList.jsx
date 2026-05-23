import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { informasiService } from '../../services/informasiService'
import { useAuthStore } from '../../store/authStore'
import { ROLES } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'

export default function InformasiList() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const canManage = user?.role === ROLES.KMF 
  
  const { data: informasi, loading, refetch } = useApi(informasiService.getAll, [])

  // Normalkan data agar selalu berupa Array
  const listInformasi = Array.isArray(informasi) ? informasi : (informasi?.results || [])

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus pengumuman ini?')) {
      try {
        await informasiService.delete(id)
        toast.success('Informasi berhasil dihapus')
        refetch()
      } catch (error) {
        toast.error('Gagal menghapus informasi')
      }
    }
  }

  return (
    <>
      <PageHeader
        title="Pusat Informasi"
        subtitle="Pengumuman kegiatan mentoring, Cinta Subuh, dan Tabligh Akbar"
        action={
          canManage && (
            <Link to="/informasi/create">
              <Button>Tambah Informasi</Button>
            </Link>
          )
        }
      />

      <div className="mt-6">
        {loading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  {/* 👈 UBAH: Nama kolom diperjelas */}
                  <th className="px-4 py-3 w-48">Tanggal Kegiatan</th>
                  <th className="px-4 py-3 w-1/4">Judul Kegiatan</th>
                  <th className="px-4 py-3">Detail Informasi</th>
                  <th className="px-4 py-3 w-32 text-center">Poster</th>
                  {canManage && <th className="px-4 py-3 text-right w-40">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {listInformasi.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 5 : 4} className="px-4 py-8 text-center text-gray-500">
                      Belum ada pengumuman kegiatan saat ini.
                    </td>
                  </tr>
                ) : (
                  listInformasi.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      {/* 👈 UBAH: Murni menampilkan Tanggal Kegiatan */}
                      <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-medium">
                        {item.tanggal_kegiatan ? formatDate(item.tanggal_kegiatan) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{item.judul}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <p className="line-clamp-2">{item.isi}</p>
                      </td>
                      
                      <td className="px-4 py-3 text-center">
                        {item.poster ? (
                          <a 
                            href={item.poster} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            Lihat
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="secondary" onClick={() => navigate(`/informasi/edit/${item.id}`)}>
                              Edit
                            </Button>
                            <Button size="sm" onClick={() => handleDelete(item.id)}>
                              Hapus
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}