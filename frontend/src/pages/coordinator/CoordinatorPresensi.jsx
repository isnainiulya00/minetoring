import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Card from '../../components/ui/Card'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'

const byHalaqoh = {
  'Halaqoh A': [
    { id: 1, mentee: 'Aisyah Rahma', pertemuan: 'Pertemuan 5', status: 'Hadir', tanggal: '2026-04-01' },
    { id: 2, mentee: 'Bima Pratama', pertemuan: 'Pertemuan 5', status: 'Izin', tanggal: '2026-04-01' },
  ],
  'Halaqoh B': [
    { id: 3, mentee: 'Dina Sari', pertemuan: 'Pertemuan 3', status: 'Hadir', tanggal: '2026-03-30' },
  ],
}

export default function CoordinatorPresensi() {
  const [hq, setHq] = useState('Halaqoh A')
  const rows = byHalaqoh[hq] || []

  const columns = [
    { key: 'mentee', header: 'Mentee' },
    { key: 'pertemuan', header: 'Pertemuan' },
    { key: 'tanggal', header: 'Tanggal' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
          {row.status}
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Presensi"
        // description="Akses rekap presensi per halaqoh (read-only admin; mentor mengisi detail)."
      />
      <Card
        title="Filter halaqoh"
        className="mb-4"
        action={
          <Select value={hq} onChange={(e) => setHq(e.target.value)} className="min-w-[10rem]">
            <option>Halaqoh AA-01</option>
            <option>Halaqoh AB-01</option>
          </Select>
        }
      />
      <Card title={`Rekap — ${hq}`}>
        <Table columns={columns} data={rows} keyExtractor={(r) => r.id} />
      </Card>
    </>
  )
}
