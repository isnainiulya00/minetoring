import ResourceCrudPage from '../../components/crud/ResourceCrudPage'
import { sertifikatService } from '../../services/sertifikatService'
import { useAuthStore } from '../../store/authStore'
import { canManageSertifikat } from '../../utils/roleHelpers'

export default function Sertifikat() {
  const user = useAuthStore((s) => s.user)
  const canManage = canManageSertifikat(user)

  return (
    <ResourceCrudPage
      title="Sertifikat"
      subtitle={canManage ? 'Kelola sertifikat mentor dan mentee' : 'Lihat sertifikat Anda'}
      service={sertifikatService}
      canCreate={canManage}
      canDelete={canManage}
      searchKeys={['nomor_sertifikat', 'sebagai']}
      columns={[
        { key: 'nomor_sertifikat', label: 'Nomor' },
        { key: 'sebagai', label: 'Sebagai' },
        { key: 'user', label: 'User ID' },
        { key: 'link_drive', label: 'Link' },
        ...(canManage ? [{ key: 'aksi', label: 'Aksi' }] : []),
      ]}
      fields={[
        { key: 'nomor_sertifikat', label: 'Nomor Sertifikat', required: true },
        {
          key: 'sebagai',
          label: 'Sebagai',
          type: 'select',
          required: true,
          options: [
            { value: 'MENTOR', label: 'Mentor' },
            { value: 'MENTEE', label: 'Mentee' },
          ],
        },
        { key: 'user', label: 'User ID', type: 'number', required: true },
        { key: 'link_drive', label: 'Link Google Drive', required: true },
      ]}
      getInitialForm={() => ({
        nomor_sertifikat: '',
        sebagai: 'MENTEE',
        user: '',
        link_drive: '',
      })}
    />
  )
}
