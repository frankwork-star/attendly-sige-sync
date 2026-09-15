CREATE POLICY "docs_matricula_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'documentos-matricula');
CREATE POLICY "docs_matricula_insert" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'documentos-matricula');
CREATE POLICY "docs_matricula_update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'documentos-matricula');
CREATE POLICY "docs_matricula_delete" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'documentos-matricula');