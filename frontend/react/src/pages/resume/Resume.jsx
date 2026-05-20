import { useMemo, useState } from 'react'

import toast from 'react-hot-toast'

import { HiOutlineDocumentArrowUp, HiOutlineEye } from 'react-icons/hi2'

import PageHeader from '../../components/common/PageHeader'

import Card from '../../components/common/Card'

import Badge from '../../components/common/Badge'

import Button from '../../components/common/Button'

import Modal from '../../components/common/Modal'

import Input from '../../components/common/Input'

import EmptyState from '../../components/common/EmptyState'

import HalaqohRekapTable from '../../components/rekap/HalaqohRekapTable'

import { TableSkeleton } from '../../components/common/Skeleton'

import { useApi } from '../../hooks/useApi'

import { resumeService } from '../../services/resumeService'

import { jadwalService } from '../../services/jadwalService'

import { menteeService } from '../../services/menteeService'

import { analyticsService } from '../../services/analyticsService'

import { useAuthStore } from '../../store/authStore'

import { canGradeResume, canUploadResume, isMonitoring } from '../../utils/roleHelpers'

import { mediaUrl } from '../../utils/mediaUrl'



export default function Resume() {

  const user = useAuthStore((s) => s.user)

  const { data: resumes, loading, refetch } = useApi(resumeService.getAll, [])

  const { data: jadwal } = useApi(jadwalService.getAll, [])

  const { data: mentees } = useApi(menteeService.getAll, [])

  const { data: rekap, loading: rekapLoading } = useApi(

    () => (isMonitoring(user) ? analyticsService.rekapHalaqah() : Promise.resolve([])),

    [user?.role],

  )



  const [uploadOpen, setUploadOpen] = useState(false)

  const [gradeRow, setGradeRow] = useState(null)

  const [selectedJadwal, setSelectedJadwal] = useState('')

  const [file, setFile] = useState(null)

  const [nilai, setNilai] = useState('')

  const [catatan, setCatatan] = useState('')

  const [uploading, setUploading] = useState(false)



  const myMentee = useMemo(

    () => (mentees ?? []).find((m) => m.user === user?.id),

    [mentees, user?.id],

  )



  const jadwalOptions = useMemo(() => {

    if (!myMentee?.halaqah) return jadwal ?? []

    return (jadwal ?? []).filter((j) => j.halaqah === myMentee.halaqah)

  }, [jadwal, myMentee])



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

      const existing = (resumes ?? []).find(

        (r) => r.jadwal === Number(selectedJadwal) && r.mentee === myMentee?.id,

      )

      if (existing) await resumeService.update(existing.id, fd)

      else await resumeService.create(fd)

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



  const handleGrade = async (e) => {

    e.preventDefault()

    try {

      await resumeService.grade(gradeRow.id, {

        nilai: nilai ? Number(nilai) : null,

        catatan_mentor: catatan,

      })

      toast.success('Penilaian disimpan')

      setGradeRow(null)

      refetch()

    } catch {

      toast.error('Gagal menyimpan penilaian')

    }

  }



  if (isMonitoring(user)) {

    return (

      <>

        <PageHeader title="Rekap Resume" subtitle="Progress pengumpulan resume per halaqah" />

        <HalaqohRekapTable data={rekap} loading={rekapLoading} />

      </>

    )

  }



  return (

    <>

      <PageHeader

        title="Resume"

        subtitle={canUploadResume(user) ? 'Unggah resume per pertemuan' : 'Penilaian resume mentee'}

        action={

          canUploadResume(user) && (

            <Button onClick={() => setUploadOpen(true)}>

              <HiOutlineDocumentArrowUp className="mr-1 h-4 w-4" />

              Upload Resume

            </Button>

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

                  <h3 className="font-semibold text-gray-900">{r.mentee_nama || 'Mentee'}</h3>

                  <p className="text-sm text-gray-500">Pertemuan #{r.pertemuan_ke ?? r.jadwal}</p>

                </div>

                <Badge variant={r.file || r.file_url ? 'success' : 'warning'}>

                  {r.file || r.file_url ? 'Sudah upload' : 'Belum'}

                </Badge>

              </div>

              {r.nilai != null && <p className="mt-2 text-sm text-gray-600">Nilai: {r.nilai}</p>}

              {r.catatan_mentor && (

                <p className="mt-1 text-xs text-gray-500">{r.catatan_mentor}</p>

              )}

              <div className="mt-4 flex flex-wrap gap-2">

                {(r.file_url || r.file) && (

                  <a

                    href={mediaUrl(r.file_url || r.file)}

                    target="_blank"

                    rel="noreferrer"

                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"

                  >

                    <HiOutlineEye className="h-4 w-4" />

                    Buka file

                  </a>

                )}

                {canGradeResume(user) && (

                  <Button

                    size="sm"

                    variant="secondary"

                    onClick={() => {

                      setGradeRow(r)

                      setNilai(r.nilai ?? '')

                      setCatatan(r.catatan_mentor ?? '')

                    }}

                  >

                    Nilai

                  </Button>

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

                <option key={j.id} value={j.id}>

                  #{j.pertemuan_ke} — {j.topik || 'Pertemuan'}

                </option>

              ))}

            </select>

          </div>

          <div>

            <label className="text-sm font-medium text-gray-700">File (PDF/DOC)</label>

            <input

              type="file"

              required

              accept=".pdf,.doc,.docx"

              className="mt-1 block w-full text-sm"

              onChange={(e) => setFile(e.target.files?.[0])}

            />

          </div>

          <Button type="submit" disabled={uploading} className="w-full">

            {uploading ? 'Mengunggah...' : 'Upload'}

          </Button>

        </form>

      </Modal>



      <Modal open={Boolean(gradeRow)} onClose={() => setGradeRow(null)} title="Penilaian Resume">

        <form onSubmit={handleGrade} className="space-y-4">

          <Input label="Nilai (0-100)" type="number" min={0} max={100} value={nilai} onChange={(e) => setNilai(e.target.value)} />

          <div>

            <label className="text-sm font-medium text-gray-700">Catatan mentor</label>

            <textarea

              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"

              rows={3}

              value={catatan}

              onChange={(e) => setCatatan(e.target.value)}

            />

          </div>

          <Button type="submit" className="w-full">

            Simpan

          </Button>

        </form>

      </Modal>

    </>

  )

}

