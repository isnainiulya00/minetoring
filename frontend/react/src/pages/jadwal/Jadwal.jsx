import ResourceCrudPage from '../../components/crud/ResourceCrudPage'
import { jadwalService } from '../../services/jadwalService'
import { useAuthStore } from '../../store/authStore'
import { isKMF } from '../../utils/roleHelpers'

export default function Jadwal() {
  const user = useAuthStore((s) => s.user)
  const canManage = isKMF(user)

  return (
    <ResourceCrudPage
      title="Jadwal Pertemuan"
      subtitle={canManage ? 'Kelola jadwal pertemuan halaqah' : 'Lihat jadwal pertemuan'}
      service={jadwalService}
      canCreate={canManage}
      canDelete={canManage}
      searchKeys={['topik', 'pertemuan_ke']}
      columns={[
        { key: 'pertemuan_ke', label: 'Pertemuan' },
        { key: 'tanggal', label: 'Tanggal' },
        { key: 'topik', label: 'Topik' },
        { key: 'halaqah', label: 'Halaqah ID' },
        ...(canManage ? [{ key: 'aksi', label: 'Aksi' }] : []),
      ]}
      fields={[
        { key: 'halaqah', label: 'Halaqah ID', type: 'number', required: true },
        { key: 'pertemuan_ke', label: 'Pertemuan Ke', type: 'number', required: true },
        { key: 'tanggal', label: 'Tanggal (YYYY-MM-DD)', required: true },
        { key: 'topik', label: 'Topik', required: true },
      ]}
      getInitialForm={() => ({ halaqah: '', pertemuan_ke: 1, tanggal: '', topik: '' })}
    />
  )
}
