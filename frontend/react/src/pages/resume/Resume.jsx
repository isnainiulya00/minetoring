import { useState } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineDocumentArrowUp, HiOutlineEye } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { resumeService } from '../../services/resumeService'
import { menteeService } from '../../services/menteeService'
import { API_BASE_URL } from '../../utils/constants'
import { useAuthStore } from '../../store/authStore'
import { isMentee } from '../../utils/roleHelpers'

export default function Resume() {
  const user = useAuthStore((s) => s.user)
  const { data: resumes, loading, refetch } = useApi(resumeService.getAll, [])
  const { data: mentees } = useApi(menteeService.getAll, [])
  const [uploading, setUploading] = useState(false)

  const menteeMap = Object.fromEntries((mentees ?? []).map((m) => [m.id, m.nama_lengkap]))

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mentee', mentees?.[0]?.id || 1)
    formData.append('jadwal', 1)
    setUploading(true)
    try {
      await resumeService.create(formData)
      toast.success('Resume berhasil diunggah')
      refetch()
    } catch {
      toast.error('Gagal mengunggah resume')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Resume"
        subtitle="Pengumpulan dan penilaian resume mentoring"
        action={
          isMentee(user) && (
            <label className="inline-flex cursor-pointer">
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleUpload} />
              <span className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
                {uploading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <HiOutlineDocumentArrowUp className="h-4 w-4" />
                )}
                Upload Resume
              </span>
            </label>
          )
        }
      />

      {loading ? (
        <TableSkeleton rows={4} cols={2} />
      ) : !resumes?.length ? (
        <EmptyState title="Belum ada resume" description="Mentee dapat mengunggah resume per pertemuan." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <Card key={r.id} hover>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{menteeMap[r.mentee] || 'Mentee'}</h3>
                  <p className="text-sm text-gray-500">Pertemuan #{r.jadwal}</p>
                </div>
                <Badge variant={r.file ? 'success' : 'warning'}>
                  {r.file ? 'Sudah upload' : 'Belum upload'}
                </Badge>
              </div>
              {r.nilai != null && (
                <p className="mt-2 text-sm text-gray-600">Nilai: {r.nilai}</p>
              )}
              {r.file && (
                <a
                  href={r.file.startsWith('http') ? r.file : `${API_BASE_URL}${r.file}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <HiOutlineEye className="h-4 w-4" />
                  Preview file
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
