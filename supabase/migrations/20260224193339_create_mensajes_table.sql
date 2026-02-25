-- Crear tabla de mensajes para el chat global de obras
CREATE TABLE IF NOT EXISTS public.mensajes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    remitente_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    leido BOOLEAN DEFAULT FALSE NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad (RLS)
-- 1. Todos los usuarios autenticados pueden ver los mensajes (Chat Global de la Empresa)
CREATE POLICY "Usuarios pueden ver todos los mensajes" 
ON public.mensajes 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 2. Los usuarios solo pueden insertar mensajes a nombre propio
CREATE POLICY "Usuarios pueden enviar mensajes" 
ON public.mensajes 
FOR INSERT 
WITH CHECK (auth.uid() = remitente_id);

-- 3. Los usuarios solo pueden eliminar sus propios mensajes
CREATE POLICY "Usuarios pueden eliminar sus propios mensajes" 
ON public.mensajes 
FOR DELETE 
USING (auth.uid() = remitente_id);

-- Habilitar Realtime para la tabla mensajes
-- Permitir que las inserciones emitan eventos websocket para el chat instantáneo
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes;

-- Índices para mejorar la velocidad de lectura del chat
CREATE INDEX IF NOT EXISTS mensajes_creado_en_idx ON public.mensajes(creado_en DESC);
CREATE INDEX IF NOT EXISTS mensajes_remitente_id_idx ON public.mensajes(remitente_id);
