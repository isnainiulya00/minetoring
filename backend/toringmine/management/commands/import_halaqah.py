import csv
from django.core.management.base import BaseCommand
from django.db import transaction
from toringmine.models import User, Mentor, Mentee, Halaqah # Sesuaikan 'myapp' dengan nama app-mu!

class Command(BaseCommand):
    help = 'Import User, Profil, dan otomatis gabung Halaqah dari CSV'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path ke file CSV')
        parser.add_argument('--is_mentor', action='store_true', help='Set jika ini CSV Mentor')

    @transaction.atomic
    def handle(self, *args, **options):
        csv_file = options['csv_file']
        is_mentor = options['is_mentor']

        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # 1. Buat / Ambil User
                user, created = User.objects.get_or_create(
                    username=row['username'],
                    defaults={
                        'email': row['email'],
                        'first_name': row['first_name'],
                        'last_name': row['last_name'],
                        'role': row['role'],
                        'nim': row['nim'],
                        'no_hp': row['no_hp']
                    }
                )
                if created:
                    user.set_password(row['password'])
                    user.save()

                # 2. Ambil Info Halaqah dari CSV
                nama_kelompok = row['nama_kelompok']
                tingkat = row['tingkat_halaqah']

                if is_mentor:
                    # 3A. Khusus CSV Mentor: Buat Halaqah-nya!
                    mentor_profile = Mentor.objects.get(user=user)
                    Halaqah.objects.get_or_create(
                        nama_kelompok=nama_kelompok,
                        defaults={
                            'tingkat': tingkat,
                            'mentor': mentor_profile,
                            'semester_aktif': '2025-Ganjil'
                        }
                    )
                    self.stdout.write(self.style.SUCCESS(f'Berhasil membuat Mentor {user.nim} & Halaqah {nama_kelompok}'))
                
                else:
                    # 3B. Khusus CSV Mentee: Masukkan ke Halaqah!
                    mentee_profile = Mentee.objects.get(user=user)
                    halaqah_obj = Halaqah.objects.filter(nama_kelompok=nama_kelompok).first()
                    
                    if halaqah_obj:
                        mentee_profile.halaqah = halaqah_obj
                        mentee_profile.prodi = row['prodi']
                        mentee_profile.save()
                        self.stdout.write(self.style.SUCCESS(f'Mentee {user.nim} masuk ke {nama_kelompok}'))
                    else:
                        self.stdout.write(self.style.WARNING(f'Halaqah {nama_kelompok} belum ada untuk Mentee {user.nim}!'))