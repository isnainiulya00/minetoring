import ResourceCrudPage from '../../components/crud/ResourceCrudPage'
import Badge from '../../components/common/Badge'
import { menteeService } from '../../services/menteeService'

export default function MenteeList() {
  return (
    <ResourceCrudPage
      title="Data Mentee"
      subtitle="Kelola profil mentee mentoring fakultas"
      service={menteeService}
      searchKeys={['nama_lengkap', 'nim', 'prodi']}
      columns={[
        { key: 'nim', label: 'NIM' },
        { key: 'nama_lengkap', label: 'Nama' },
        { key: 'prodi', label: 'Prodi' },
        {
          key: 'presensi',
          label: 'Kehadiran',
          render: (row) =>
            row.presensi_summary ? (
              <span className="flex flex-wrap gap-1">
                <Badge variant="success">Hadir {row.presensi_summary.hadir}</Badge>
                <Badge variant="warning">Izin {row.presensi_summary.izin}</Badge>
                <Badge variant="neutral">Alpha {row.presensi_summary.alpha}</Badge>
              </span>
            ) : (
              '—'
            ),
        },
        { key: 'aksi', label: 'Aksi' },
      ]}
      fields={[
        { key: 'nim', label: 'NIM', required: true },
        { key: 'nama_lengkap', label: 'Nama Lengkap', required: true },
        { key: 'prodi', label: 'Prodi' },
        { key: 'halaqah', label: 'Halaqah ID', type: 'number' },
        { key: 'user', label: 'User ID', type: 'number', required: true },
      ]}
      getInitialForm={() => ({ nim: '', nama_lengkap: '', prodi: '', halaqah: '', user: '' })}
    />
  )
}
