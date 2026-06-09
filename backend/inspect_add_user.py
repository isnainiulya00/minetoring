import os
import sys
import uuid
from pathlib import Path

sys.path.insert(0, r'd:\minetoring\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'minetoring.settings')
import django

django.setup()

from rest_framework.test import APIClient
from toringmine.models import User

client = APIClient()
client.defaults['HTTP_HOST'] = 'testserver'

username = f'kmf_{uuid.uuid4().hex[:8]}'
User.objects.create_user(username=username, password='kmf_pass', role='KMF')
resp = client.post('/api/login/', {'username': username, 'password': 'kmf_pass'}, format='json')

payload = {
    'username': f'new_{uuid.uuid4().hex[:8]}',
    'email': 'new@example.com',
    'role': 'MENTEE',
    'nim': f'M{uuid.uuid4().hex[:6]}',
    'first_name': 'Mentee Baru',
    'last_name': '',
    'prodi': 'Sistem Informasi',
    'fakultas': '',
    'no_hp': '',
}

if resp.status_code == 200 and hasattr(resp, 'data'):
    token = resp.data.get('access')
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

resp2 = client.post('/api/kmf/tambah-user/', payload, format='json')

Path(r'd:\minetoring\backend\debug_response.txt').write_text(
    f'status={resp2.status_code}\ncontent={getattr(resp2, "data", resp2.content)}\n'
)
print('done')
