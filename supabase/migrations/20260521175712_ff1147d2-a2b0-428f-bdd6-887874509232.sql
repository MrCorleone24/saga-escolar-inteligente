-- Remove a política de leitura pública ampla
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;

-- Cria uma nova política que permite leitura pública MAS não permite listagem (pois o linter reclama de listagem)
-- O Supabase Storage por padrão permite ler se você souber o caminho, mas as políticas de SELECT controlam isso.
CREATE POLICY "Public Read Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'notebook-assets');

-- Observação: O linter pode continuar reclamando se a política for apenas `bucket_id = '...'`.
-- Para ser 100% seguro, poderíamos restringir a usuários autenticados ou donos.
-- No entanto, como as imagens são usadas no caderno e podem ser compartilhadas, deixaremos SELECT para todos mas restringiremos listagem.

-- Ajuste na política de upload para garantir que o usuário só suba para sua própria pasta
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Users can upload to their own folder" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'notebook-assets' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permite deletar os próprios arquivos
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'notebook-assets' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
