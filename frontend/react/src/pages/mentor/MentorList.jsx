import ResourceCrudPage from '../../components/crud/ResourceCrudPage'
import { mentorService } from '../../services/mentorService'

export default function MentorList() {
  return (
    <ResourceCrudPage
      title="Data Mentor"
      subtitle="Kelola profil mentor mentoring fakultas"
      service={mentorService}
      searchKeys={['nama_lengkap', 'no_hp']}
      columns={[
        { key: 'nama_lengkap', label: 'Nama' },
        { key: 'no_hp', label: 'No. HP' },
        { key: 'user', label: 'User ID' },
        { key: 'aksi', label: 'Aksi' },
      ]}
      fields={[
        { key: 'nama_lengkap', label: 'Nama Lengkap', required: true },
        { key: 'no_hp', label: 'No. HP' },
        { key: 'user', label: 'User ID', type: 'number', required: true },
      ]}
      getInitialForm={() => ({ nama_lengkap: '', no_hp: '', user: '' })}
    />
  )
}
