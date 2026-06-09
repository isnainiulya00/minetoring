from django.test import TestCase

from toringmine.models import User, Mentor, Halaqah, Mentee


class ModelsTestCase(TestCase):
    def test_user_str_includes_username_and_role(self):
        user = User.objects.create_user(
            username='testuser',
            password='password',
            role='MENTOR',
        )
        self.assertEqual(str(user), 'testuser (Mentor)')

    def test_mentor_str_returns_full_name(self):
        user = User.objects.create_user(
            username='mentor',
            password='password',
            role='MENTOR',
        )
        mentor = Mentor.objects.create(user=user, nama_lengkap='Mentor Nama')
        self.assertEqual(str(mentor), 'Mentor Nama')

    def test_halaqah_str_returns_group_name(self):
        hal = Halaqah.objects.create(
            nama_kelompok='Kelompok Test',
            tingkat='TAHSIN',
        )
        self.assertEqual(str(hal), 'Kelompok Test')

    def test_mentee_str_contains_nim_and_name(self):
        user = User.objects.create_user(
            username='mentee',
            password='password',
            role='MENTEE',
        )
        hal = Halaqah.objects.create(
            nama_kelompok='Kelompok Test',
            tingkat='TAHFIDZ',
        )
        mentee = Mentee.objects.create(
            user=user,
            halaqah=hal,
            nim='M100',
            nama_lengkap='Mentee Nama',
            prodi='Teknik Informatika',
        )
        self.assertEqual(str(mentee), 'M100 - Mentee Nama')
