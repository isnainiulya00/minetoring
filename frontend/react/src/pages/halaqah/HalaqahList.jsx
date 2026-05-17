import { Link } from 'react-router-dom'
import { HiOutlineChevronRight } from 'react-icons/hi2'
import PageHeader from '../../components/common/PageHeader'
import SearchBar from '../../components/common/SearchBar'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { TableSkeleton } from '../../components/common/Skeleton'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { halaqahService } from '../../services/halaqahService'
import { mentorService } from '../../services/mentorService'
import { TINGKAT_HALAQAH } from '../../utils/constants'
import { useState, useMemo } from 'react'

export default function HalaqahList() {
  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const { data: halaqah, loading } = useApi(halaqahService.getAll, [])
  const { data: mentors } = useApi(mentorService.getAll, [])

  const mentorMap = useMemo(
    () => Object.fromEntries((mentors ?? []).map((m) => [m.id, m.nama_lengkap])),
    [mentors],
  )

  const filtered = useMemo(
    () =>
      (halaqah ?? []).filter((h) =>
        h.nama_kelompok?.toLowerCase().includes(debounced.toLowerCase()),
      ),
    [halaqah, debounced],
  )

  return (
    <>
      <PageHeader title="Halaqah" subtitle="Kelola kelompok mentoring AIK" />
      <SearchBar value={search} onChange={setSearch} placeholder="Cari halaqah..." className="mb-6 max-w-md" />

      {loading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : filtered.length === 0 ? (
        <EmptyState title="Belum ada halaqah" description="Data halaqah akan muncul setelah ditambahkan admin." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((h) => (
            <Link key={h.id} to={`/halaqah/${h.id}`}>
              <Card hover className="group h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-gray-900 group-hover:text-gray-700">
                      {h.nama_kelompok}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Mentor: {mentorMap[h.mentor] || '-'}
                    </p>
                  </div>
                  <HiOutlineChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-600" />
                </div>
                <div className="mt-4 flex gap-2">
                  <Badge variant="neutral">{TINGKAT_HALAQAH[h.tingkat] || h.tingkat}</Badge>
                  <Badge variant="success">Aktif</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

