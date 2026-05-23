import { useState } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineEye } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { resumeService } from '../../services/resumeService'
import { mediaUrl } from '../../utils/mediaUrl'

export default function ResumeReview() {
  // Asumsi: endpoint getAll pada akun mentor hanya mengembalikan data resume dari anak halaqahnya
  const { data: resumes, loading, refetch } = useApi(resumeService.getAll, [])
  
  const [gradeRow, setGradeRow] = useState(null)
  const [nilai, setNilai] = useState('')
  const [catatan, setCatatan] = useState('')

  const handleGrade = async (e) => {
    e.preventDefault()
    try {
      await resumeService.grade(gradeRow.id, {
        nilai: nilai ? Number(nilai) : null,
        catatan_mentor: catatan,
      })
      toast.success('Penilaian berhasil disimpan!')
      setGradeRow(null)
      refetch()
    } catch {
      toast.error('Gagal menyimpan penilaian.')
    }
  }

  if (loading) return <TableSkeleton rows={4} cols={3} />

  return (
    <>
      <PageHeader
        title="Review Resume Mentee"
        subtitle="Berikan penilaian dan catatan pada resume yang dikumpulkan mentee"
      />

      {!resumes?.length ? (
        <EmptyState title="Belum ada resume" description="Anak didik Anda belum mengumpulkan resume." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {resumes.map((r) => (
            <Card key={r.id} hover>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{r.mentee_nama || 'Mentee'}</h3>
                  <p className="text-sm text-gray-500">Pertemuan #{r.pertemuan_ke ?? r.jadwal}</p>
                </div>
                <Badge variant={r.nilai != null ? 'success' : 'warning'}>
                  {r.nilai != null ? 'Telah Dinilai' : 'Belum Dinilai'}
                </Badge>
              </div>
              
              {r.nilai != null && (
                <div className="mt-3">
                  <p className="text-sm text-gray-700">Nilai: <span className="font-bold">{r.nilai}</span></p>
                  {r.catatan_mentor && <p className="text-xs text-gray-500 italic mt-1">"{r.catatan_mentor}"</p>}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                {(r.file_url || r.file) && (
                  <a
                    href={mediaUrl(r.file_url || r.file)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <HiOutlineEye className="h-4 w-4" /> Buka
                  </a>
                )}
                
                <Button
                  size="sm"
                  variant="secondary"
                  className="ml-auto"
                  onClick={() => {
                    setGradeRow(r)
                    setNilai(r.nilai ?? '')
                    setCatatan(r.catatan_mentor ?? '')
                  }}
                >
                  Beri Nilai
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={Boolean(gradeRow)} onClose={() => setGradeRow(null)} title={`Nilai: ${gradeRow?.mentee_nama || 'Mentee'}`}>
        <form onSubmit={handleGrade} className="space-y-4">
          <Input 
            label="Nilai Angka (0-100)" 
            type="number" 
            min={0} max={100} 
            value={nilai} 
            onChange={(e) => setNilai(e.target.value)} 
            required
          />
          <div>
            <label className="text-sm font-medium text-gray-700">Catatan / Feedback</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              rows={3}
              placeholder="Berikan masukan untuk mentee..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">Simpan Penilaian</Button>
        </form>
      </Modal>
    </>
  )
}