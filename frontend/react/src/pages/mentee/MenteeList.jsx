import ResourceCrudPage from '../../components/crud/ResourceCrudPage'
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
        { key: 'aksi', label: 'Aksi' },
      ]}
      fields={[
        { key: 'nim', label: 'NIM', required: true },
        { key: 'nama_lengkap', label: 'Nama Lengkap', required: true },
        { key: 'prodi', label: 'Prodi' },
        { key: 'user', label: 'User ID', type: 'number', required: true },
      ]}
      getInitialForm={() => ({ nim: '', nama_lengkap: '', prodi: '', user: '' })}
    />
  )
}
