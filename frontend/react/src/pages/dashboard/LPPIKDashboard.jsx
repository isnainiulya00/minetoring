import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'

export default function LPPIKDashboard() {
  return (
    <>
      <PageHeader 
        title="Dasbor LPPIK" 
        subtitle="Pemantauan keseluruhan program mentoring MINE-TORING" 
      />
      
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-gray-500">Total Halaqah</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900">Aktif</h3>
        </Card>
        
        <Card className="p-6 border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500">Presensi Berjalan</p>
          <h3 className="mt-2 text-3xl font-bold text-gray-900">Aman</h3>
        </Card>
      </div>

      <Card className="mt-6 p-8 text-center" glass>
        <h3 className="text-lg font-semibold text-gray-800">Sistem Berjalan Normal</h3>
        <p className="text-sm text-gray-500 mt-2">Data analitik lengkap dapat dilihat pada menu Monitoring.</p>
      </Card>
    </>
  )
}