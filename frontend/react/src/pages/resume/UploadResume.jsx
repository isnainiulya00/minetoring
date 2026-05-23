import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineDocumentArrowUp, HiOutlineEye } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { resumeService } from '../../services/resumeService'
import { jadwalService } from '../../services/jadwalService'
import { menteeService } from '../../services/menteeService'
import { useAuthStore } from '../../store/authStore'
import { mediaUrl } from '../../utils/mediaUrl'

export default function UploadResume() {
  const user = useAuthStore((s) => s.user)
  
  // Mentee hanya menarik data resumenya sendiri (sebaiknya ini difilter di backend, tapi kita filter juga di frontend untuk jaga-jaga)
  const { data: resumes, loading, refetch } = useApi(resumeService.getAll, [])
  const { data: jadwal } = useApi(jadwalService.getAll, [])
  const { data: mentees } = useApi(menteeService.getAll, [])

  const [uploadOpen, setUploadOpen] = useState(false)
  const [selectedJadwal, setSelectedJadwal] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Mencari ID mentee milik user yang sedang login
  const myMentee = useMemo(() => (mentees ?? []).find((m) => m.user === user?.id), [mentees, user?.id])

  // Menampilkan hanya jadwal dari kelompok halaqah mentee ini
  const jadwalOptions = useMemo(() => {
    if (!myMentee?.halaqah) return jadwal ?? []
    return (jadwal ?? []).filter((j) => j.halaqah === myMentee.halaqah)
  }, [jadwal, myMentee])

  const myResumes = useMemo(() => {
    if (!myMentee?.id) return []
    return (resumes ?? []).filter((r) => r.mentee === myMentee.id)
  }, [resumes, myMentee])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !selectedJadwal) {
      toast.error('Pilih pertemuan dan file resume')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('jadwal', selectedJadwal)
      // Asumsi backend otomatis mengenali mentee dari token, atau perlu append: fd.append('mentee', myMentee.id)
      
      const existing = myResumes.find((r) => r.jadwal === Number(selectedJadwal))
      if (existing) {
        await resumeService.update(existing.id, fd)
      } else {
        await resumeService.create(fd)
      }
      
      toast.success('Resume berhasil diunggah')
      setUploadOpen(false)
      setFile(null)
      refetch()
    } catch {
      toast.error('Gagal mengunggah resume')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <TableSkeleton rows={4} cols={2} />

  return (
    <>
      <PageHeader
        title="Resume Mentoring"
        subtitle="Unggah ringkasan materi untuk kelompok Tahfidz dan Tahsin"
        action={
          <Button onClick={() => setUploadOpen(true)}>
            <HiOutlineDocumentArrowUp className="mr-1 h-4 w-4 inline" /> Upload Resume
          </Button>
        }
      />

      {!myResumes?.length ? (
        <EmptyState title="Belum ada resume" description="Anda belum mengunggah resume apa pun." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {myResumes.map((r) => (
            <Card key={r.id} hover>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Pertemuan #{r.pertemuan_ke ?? r.jadwal}</h3>
                  <p className="text-sm text-gray-500">{r.topik || 'Materi Mentoring'}</p>
                </div>
                <Badge variant="success">Terkirim</Badge>
              </div>
              
              {r.nilai != null && (
                <div className="mt-3 rounded-lg bg-blue-50 p-3">
                  <p className="text-sm font-semibold text-blue-800">Nilai: {r.nilai}</p>
                  {r.catatan_mentor && <p className="mt-1 text-xs text-blue-600">Catatan: {r.catatan_mentor}</p>}
                </div>
              )}
              
              <div className="mt-4 border-t border-gray-100 pt-3">
                {(r.file_url || r.file) && (
                  <a
                    href={mediaUrl(r.file_url || r.file)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <HiOutlineEye className="h-4 w-4" /> Lihat File
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Resume">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Pertemuan</label>
            <select
              required
              value={selectedJadwal}
              onChange={(e) => setSelectedJadwal(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Pilih pertemuan</option>
              {jadwalOptions.map((j) => (
                <option key={j.id} value={j.id}>#{j.pertemuan_ke} — {j.topik || 'Pertemuan'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">File Resume (PDF/DOC)</label>
            <input
              type="file"
              required
              accept=".pdf,.doc,.docx"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
          </div>
          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? 'Mengunggah...' : 'Upload File'}
          </Button>
        </form>
      </Modal>
    </>
  )
}