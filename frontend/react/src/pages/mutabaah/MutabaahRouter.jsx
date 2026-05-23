// Jangan lupa import komponen-komponennya di atas
import TahfidzForm from './Tahfidz' // (sesuaikan path-nya)
import TahsinForm from './Tahsin'
import TakhasusForm from './Takhasus'

// Bungkus ke dalam fungsi komponen
export default function MutabaahRouter({ level }) {
  
  switch(level) {
    case "tahfidz":
      return <TahfidzForm />
      
    case "tahsin":
      return <TahsinForm />
      
    case "takhasus":
      return <TakhasusForm />
      
    default:
      // Wajib ada default agar tidak blank jika 'level' kosong
      return <div>Silakan pilih kategori Mutabaah</div> 
  }
  
}