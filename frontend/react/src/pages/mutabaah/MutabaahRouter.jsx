import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Jangan lupa import komponen-komponennya (sesuaikan path-nya ya)
import TahfidzForm from './Tahfidz'; 
import TahsinForm from './Tahsin';
import TakhasusForm from './Takhasus';

export default function MutabaahRouter() {
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('mine_toring_access');

    // 1. Cek kelompok halaqah si Mentor
    axios.get('http://localhost:8000/api/halaqah/', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(res => {
      if (res.data && res.data.length > 0) {
        // 2. Ambil tingkatnya dari API (TAKHASUS/TAHSIN/TAHFIDZ)
        // Kita ubah ke huruf kecil (.toLowerCase()) biar cocok sama switch case-mu
        const tingkatHalaqah = res.data[0].tingkat.toLowerCase();
        setLevel(tingkatHalaqah);
      } else {
        setLevel('kosong'); // Handle kalau mentor belum dikasih kelompok
      }
      setLoading(false);
    })
    .catch(err => {
      console.error("Gagal mengecek tingkat halaqah:", err);
      setLoading(false);
    });
  }, []);

  // Tampilan loading saat ngecek data ke Django
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500 font-medium animate-pulse">Menyiapkan form mutabaah...</p>
      </div>
    );
  }

  // 3. Routing Otomatis berdasarkan level!
  switch(level) {
    case "tahfidz":
      return <TahfidzForm />;
      
    case "tahsin":
      return <TahsinForm />;
      
    case "takhasus":
      return <TakhasusForm />;
      
    case "kosong":
      return (
        <div className="p-8 text-center text-red-500 font-medium bg-red-50 rounded-xl m-6 border border-red-100">
          Anda belum ditugaskan ke kelompok halaqah manapun.
        </div>
      );

    default:
      return (
        <div className="p-8 text-center text-gray-500">
          Tingkat halaqah tidak valid. Silakan hubungi KMF.
        </div>
      ); 
  }
}