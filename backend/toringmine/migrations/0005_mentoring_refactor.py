import django.core.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('toringmine', '0004_alter_hafalan_id_alter_halaqah_id_alter_jadwal_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='foto',
            field=models.ImageField(blank=True, null=True, upload_to='uploads/profile/'),
        ),
        migrations.AddField(
            model_name='user',
            name='no_hp',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
        migrations.AddField(
            model_name='halaqah',
            name='semester_aktif',
            field=models.CharField(default='2025-Ganjil', max_length=50),
        ),
        migrations.AddField(
            model_name='mentee',
            name='halaqah',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='anggota_mentee',
                to='toringmine.halaqah',
            ),
        ),
        migrations.AddField(
            model_name='jadwal',
            name='semester',
            field=models.CharField(default='2025-Ganjil', max_length=50),
        ),
        migrations.AlterField(
            model_name='jadwal',
            name='tanggal',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='jadwal',
            name='topik',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='jadwal',
            name='pertemuan_ke',
            field=models.IntegerField(
                validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(12),
                ],
            ),
        ),
        migrations.AlterField(
            model_name='mentor',
            name='no_hp',
            field=models.CharField(blank=True, default='', max_length=15),
        ),
        migrations.AddField(
            model_name='hafalan',
            name='catatan_mentor',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='hafalan',
            name='nilai',
            field=models.IntegerField(
                blank=True,
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(0),
                    django.core.validators.MaxValueValidator(100),
                ],
            ),
        ),
        migrations.AddField(
            model_name='hafalan',
            name='tanggal',
            field=models.DateField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='presensi',
            name='surat_izin',
            field=models.FileField(blank=True, null=True, upload_to='uploads/surat_izin/'),
        ),
        migrations.AlterField(
            model_name='presensi',
            name='status',
            field=models.CharField(
                choices=[('HADIR', 'Hadir'), ('IZIN', 'Izin'), ('SAKIT', 'Sakit'), ('ALPHA', 'Alpha')],
                default='ALPHA',
                max_length=10,
            ),
        ),
        migrations.AlterField(
            model_name='presensi',
            name='waktu_input',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='resume',
            name='nilai',
            field=models.IntegerField(
                blank=True,
                null=True,
                validators=[
                    django.core.validators.MinValueValidator(0),
                    django.core.validators.MaxValueValidator(100),
                ],
            ),
        ),
        migrations.AlterModelOptions(
            name='jadwal',
            options={'ordering': ['semester', 'pertemuan_ke']},
        ),
        migrations.AlterUniqueTogether(
            name='jadwal',
            unique_together={('halaqah', 'semester', 'pertemuan_ke')},
        ),
        migrations.AlterUniqueTogether(
            name='presensi',
            unique_together={('mentee', 'jadwal')},
        ),
        migrations.AlterUniqueTogether(
            name='resume',
            unique_together={('mentee', 'jadwal')},
        ),
        migrations.CreateModel(
            name='MateriMentoring',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('judul', models.CharField(max_length=255)),
                ('deskripsi', models.TextField(blank=True, default='')),
                ('tipe', models.CharField(
                    choices=[('FILE', 'File / PDF'), ('LINK', 'Tautan'), ('VIDEO', 'Video')],
                    default='FILE',
                    max_length=10,
                )),
                ('file', models.FileField(blank=True, null=True, upload_to='uploads/materi/')),
                ('link_url', models.URLField(blank=True, max_length=500, null=True)),
                ('jadwal', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='materi',
                    to='toringmine.jadwal',
                )),
            ],
        ),
    ]
