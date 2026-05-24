import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Kita butuh alat pelempar (navigate)
import axios from 'axios';

const HalaqahSaya = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('mine_toring_access');

    // Minta data ke backend buat nyari tahu ID halaqah punya mentor ini
    axios.get('http://localhost:8000/api/halaqah/', { 
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(res => {
      if (res.data && res.data.length > 0) {
        const halaqahId = res.data[0].id;
        
        // 👇 LANGSUNG LEMPAR KE HALAMAN HALAQAH DETAIL 👇
        // Pastikan path-nya sesuai dengan yang ada di App.jsx / routes-mu
        // Biasanya '/halaqah/6' atau '/detail-halaqah/6'
        navigate(`/halaqah/${halaqahId}`, { replace: true }); 
      } else {
        console.warn("Mentor ini belum punya kelompok halaqah");
      }
    })
    .catch(err => {
      console.error("Gagal mengecek ID halaqah:", err);
    });
  }, [navigate]);

  // Tampilan sementara (biasanya cuma muncul sepersekian detik sebelum terlempar)
  return (
    <div className="flex items-center justify-center h-full min-h-[50vh]">
      <p className="text-gray-500 font-medium animate-pulse">
        Membuka Halaqah Anda...
      </p>
    </div>
  );
};

export default HalaqahSaya;