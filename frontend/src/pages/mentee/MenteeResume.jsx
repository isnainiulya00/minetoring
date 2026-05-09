import { useState } from 'react'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Form from '../../components/ui/Form'
import Input from '../../components/ui/Input'
import Label from '../../components/ui/Label'
import Select from '../../components/ui/Select'
import Textarea from '../../components/ui/Textarea'

export default function MenteeResume() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <>
      <PageHeader
        title="Resume pertemuan"
        // description="Ringkas poin penting dan refleksi singkat setelah setiap pertemuan."
      />
      <Card title="Form pengumpulan">
        {sent ? (
          <p className="text-sm text-emerald-700">
            Terkirim (simulasi). Hubungkan ke <code className="text-xs">POST /resumes/</code>.
          </p>
        ) : (
          <Form onSubmit={handleSubmit} className="max-w-xl">
            <div>
              <Label htmlFor="meet" required>
                Pertemuan
              </Label>
              <Select id="meet" required className="mt-1.5">
                <option value="">Pilih pertemuan</option>
                <option value="5">Pertemuan 5</option>
                <option value="4">Pertemuan 4</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="judul">Judul resume</Label>
              <Input id="judul" className="mt-1.5" placeholder="Contoh: Refleksi komunikasi" />
            </div>
            <div>
              <Label htmlFor="resume-file" required>
                Upload file resume (PDF)
              </Label>
              <Input
                id="resume-file"
                type="file"
                required
                accept="application/pdf"
                className="mt-1.5"
              />
              <p className="text-xs text-slate-500 mt-1">Format file: PDF.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Kirim</Button>
              <Button type="button" variant="secondary">
                Simpan draf
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </>
  )
}
