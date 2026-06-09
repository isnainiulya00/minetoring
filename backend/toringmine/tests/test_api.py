from rest_framework import status
from rest_framework.test import APITestCase

from toringmine.models import (
    User, Mentor, Halaqah, Mentee,
    Jadwal, Resume, Mutabaah, Sertifikat, NilaiUjian,
)


class BaseAPITestCase(APITestCase):
    def setUp(self):
        self.kmf_user = User.objects.create_user(
            username='kmf_user',
            password='kmf_pass',
            email='kmf@example.com',
            role='KMF',
        )

        self.admin_user = User.objects.create_superuser(
            username='admin_user',
            password='admin_pass',
            email='admin@example.com',
        )

        self.mentor_user = User.objects.create_user(
            username='mentor_user',
            password='mentor_pass',
            email='mentor@example.com',
            role='MENTOR',
            first_name='Mentor Test',
        )
        self.mentor_profile = getattr(self.mentor_user, 'mentor_profile', None)
        if not self.mentor_profile:
            self.mentor_profile = Mentor.objects.create(
                user=self.mentor_user,
                nama_lengkap='Mentor Test',
                no_hp='081234567890',
            )

        self.halaqah = Halaqah.objects.create(
            nama_kelompok='Kelompok 1',
            tingkat='TAKHASUS',
            mentor=self.mentor_profile,
            semester_aktif='2025-Ganjil',
        )

        self.mentee_user = User.objects.create_user(
            username='mentee_user',
            password='mentee_pass',
            email='mentee@example.com',
            role='MENTEE',
            nim='M001',
            first_name='Mentee Test',
        )
        self.mentee_profile, _ = Mentee.objects.get_or_create(
            user=self.mentee_user,
            defaults={
                'halaqah': self.halaqah,
                'nim': 'M001',
                'nama_lengkap': 'Mentee Test',
                'prodi': 'Teknik Informatika',
            },
        )
        self.mentee_profile.halaqah = self.halaqah
        self.mentee_profile.prodi = 'Teknik Informatika'
        self.mentee_profile.nama_lengkap = 'Mentee Test'
        self.mentee_profile.save()

    def get_token(self, username: str, password: str) -> str:
        response = self.client.post(
            '/api/login/',
            {'username': username, 'password': password},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data['access']


class AuthenticationTests(BaseAPITestCase):
    def test_login_returns_access_and_refresh_tokens(self):
        response = self.client.post(
            '/api/login/',
            {'username': 'kmf_user', 'password': 'kmf_pass'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_inactive_user_cannot_login(self):
        self.kmf_user.is_active = False
        self.kmf_user.save()

        response = self.client.post(
            '/api/login/',
            {'username': 'kmf_user', 'password': 'kmf_pass'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)


class UserEndpointTests(BaseAPITestCase):
    def test_users_me_returns_current_user_profile(self):
        token = self.get_token('mentor_user', 'mentor_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'mentor_user')
        self.assertEqual(response.data['role'], 'MENTOR')

    def test_users_me_can_patch_own_profile(self):
        token = self.get_token('mentor_user', 'mentor_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.patch(
            '/api/users/me/',
            {'email': 'mentor2@example.com'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'mentor2@example.com')


class KMFEndpointTests(BaseAPITestCase):
    def test_kmf_can_add_user_manual(self):
        token = self.get_token('kmf_user', 'kmf_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        payload = {
            'username': 'new_user',
            'password': 'new_password',
            'email': 'new@example.com',
            'role': 'MENTEE',
            'nim': 'M002',
            'first_name': 'Mentee Baru',
            'prodi': 'Sistem Informasi',
        }

        response = self.client.post('/api/kmf/tambah-user/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data['message'], 'User dan Profil berhasil dibuat!')

    def test_non_kmf_cannot_add_user_manual(self):
        token = self.get_token('mentor_user', 'mentor_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.post('/api/kmf/tambah-user/', {'username': 'fail'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class PermissionTests(BaseAPITestCase):
    def test_dashboard_summary_allowed_for_kmf(self):
        token = self.get_token('kmf_user', 'kmf_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/dashboard/kmf-summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_mentee', response.data)
        self.assertIn('total_mentor', response.data)
        self.assertIn('total_halaqah', response.data)

    def test_dashboard_summary_forbidden_for_mentee(self):
        token = self.get_token('mentee_user', 'mentee_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/dashboard/kmf-summary/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class HalaqahTests(BaseAPITestCase):
    def test_mentor_sees_their_halaqah_only(self):
        token = self.get_token('mentor_user', 'mentor_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/halaqah/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nama_kelompok'], 'Kelompok 1')


class ResumeAndMutabaahTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.jadwal = Jadwal.objects.create(
            pertemuan_ke=1,
            tanggal='2025-09-01',
            semester='2025-Ganjil',
        )

    def test_mentee_can_create_resume(self):
        token = self.get_token('mentee_user', 'mentee_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.post(
            '/api/resumes/',
            {
                'mentee': self.mentee_profile.id,
                'jadwal': self.jadwal.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['mentee'], self.mentee_profile.id)
        self.assertEqual(response.data['pertemuan_ke'], 1)

    def test_mentor_can_see_resume_for_their_mentee(self):
        Resume.objects.create(mentee=self.mentee_profile, jadwal=self.jadwal)

        token = self.get_token('mentor_user', 'mentor_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/resumes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['mentee'], self.mentee_profile.id)

    def test_mentee_can_create_mutabaah_and_mentor_can_see(self):
        token = self.get_token('mentee_user', 'mentee_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        payload = {
            'mentee': self.mentee_profile.id,
            'tanggal': '2025-09-02',
            'pertemuan_ke': 1,
            'materi_bacaan': 'Al-Baqarah',
            'rentang_bacaan': 'Ayat 1-5',
        }

        response = self.client.post('/api/mutabaahs/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['mentee'], self.mentee_profile.id)

        token = self.get_token('mentor_user', 'mentor_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/mutabaahs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['materi_bacaan'], 'Al-Baqarah')


class SertifikatAndNilaiUjianTests(BaseAPITestCase):
    def test_admin_can_add_user_sertifikat(self):
        token = self.get_token('admin_user', 'admin_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        payload = {
            'user_id': self.mentee_user.id,
            'sebagai': 'MENTEE',
            'link_sertifikat': 'https://example.com/sertifikat.pdf',
        }

        response = self.client.post('/api/sertifikat/add_user_sertifikat/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'Sertifikat berhasil ditambahkan!')

    def test_mentor_cannot_add_user_sertifikat(self):
        token = self.get_token('mentor_user', 'mentor_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        payload = {
            'user_id': self.mentee_user.id,
            'sebagai': 'MENTEE',
            'link_sertifikat': 'https://example.com/sertifikat.pdf',
        }

        response = self.client.post('/api/sertifikat/add_user_sertifikat/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_mentor_can_create_nilai_ujian_for_mentee(self):
        token = self.get_token('mentor_user', 'mentor_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        payload = {
            'mentee': self.mentee_user.id,
            'aspek_1': 15,
            'aspek_2': 15,
            'aspek_3': 15,
            'aspek_4': 15,
            'aspek_5': 15,
        }

        response = self.client.post('/api/nilai-ujian/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['total_nilai'], 75)
        self.assertTrue(response.data['status_lulus'])

    def test_mentee_cannot_create_nilai_ujian(self):
        token = self.get_token('mentee_user', 'mentee_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        payload = {
            'mentee': self.mentee_user.id,
            'aspek_1': 10,
            'aspek_2': 10,
            'aspek_3': 10,
            'aspek_4': 10,
            'aspek_5': 10,
        }

        response = self.client.post('/api/nilai-ujian/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_mentee_can_list_own_nilai_ujian(self):
        nilai = NilaiUjian.objects.create(
            mentee=self.mentee_user,
            aspek_1=15,
            aspek_2=15,
            aspek_3=15,
            aspek_4=15,
            aspek_5=15,
            dinilai_oleh=self.mentor_user,
        )

        token = self.get_token('mentee_user', 'mentee_pass')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        response = self.client.get('/api/nilai-ujian/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['total_nilai'], 75)
